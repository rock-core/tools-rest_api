require 'rock/webapp/tasks/cached_ports'
require 'grape_logging'

module Rock
    module WebApp
        module Tasks

            class API < Grape::API
                version 'v1', using: :header, vendor: :rock
                format :json

                if ENV["REST_API_LOG_CONSOLE"] == "TRUE"
                    puts "enabled rest_api logging to console, set environment variable REST_API_LOG_CONSOLE to anything but 'TRUE' to disable"
                    logger.formatter = GrapeLogging::Formatters::Json.new
                    use GrapeLogging::Middleware::RequestLogger, {logger: logger}
                end
                
                @ports = CachedPorts.new

                def self.ports
                    @ports
                end

                #http://stackoverflow.com/questions/106179/regular-expression-to-match-dns-hostname-or-ip-address
                ValidHostnameRegex = /\*|(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])/

                def self.stream_async_data_to_websocket(env, data_source, count = Float::INFINITY, binary)
                    emitted_samples = 0

                    # Asynchronous streaming mode
                    ws = Faye::WebSocket.new(env)

                    listener = data_source.on_raw_data do |sample|
                        result = nil
                        if binary
                            result = Hash[mode: :binary, value: sample.to_json_value(pack_simple_arrays: true, special_float_values: :string)]
                        else
                            result = Hash[value: sample.to_json_value(special_float_values: :string)]    
                        end

                        if !ws.send(MultiJson.dump(result))
                            WebApp.warn "failed to send, closing connection"
                            ws.close
                            listener.stop
                        end
                        emitted_samples += 1
                        if emitted_samples == count
                            WebApp.debug "reached requested number of samples, closing connection"
                            ws.close
                            listener.stop
                        end
                    end

                    ws.on :close do |event|
                        listener.stop
                    end

                    ws
                end

                resource :tasks do
                    desc "Lists all tasks that are currently reachable on the name services"
                    params do
                        optional :extended_info, type: Boolean, default: false
                    end
                    get do
                        if params[:extended_info]
                            Hash[tasks: Orocos.name_service.each_task.map(&:to_h)]
                        else
                            Hash[task_names: Orocos.name_service.names]
                        end
                    end

                    helpers do
                        def task_by_name(name_service, name)
                            if name_service == '*'
                                Orocos.name_service.get name
                            else
                                Orocos.name_service.get "#{name_service}/#{name}"
                            end
                        rescue Orocos::NotFound
                            error! "cannot find task #{name_service}/#{name} on the registered name services", 404
                        end

                        def port_by_task_and_name(name_service, name, port_name)
                            task_by_name(name_service, name).port(port_name)
                        rescue Orocos::NotFound
                            error! "cannot find port #{port_name} on task #{name_service}/#{name}", 404
                        end

                        def get_port(name_service, name, port_name, init = false, timeout = 30)
                            portentry = API.ports.get(name_service, name, port_name, timeout)
                            if !portentry
                                port = port_by_task_and_name(name_service, name, port_name)
                                portentry = API.ports.add(port, name_service, name, port_name, init, timeout)
                            end
                            portentry
                        end

                        def get_operation(name_service, name, operation_name)
                            task_by_name(name_service, name).operation(operation_name)
                         rescue Orocos::NotFound
                            error! "cannot find operation #{operation_name} on task #{name_service}/#{name}", 404
                        end

                    end

                    desc "Lists information about a given task"
                    get ':name_service/:name', requirements: { name_service: ValidHostnameRegex } do
                        Hash[task: task_by_name(params[:name_service], params[:name]).to_h]
                    end

                    desc "returns information about the properties of a given task"
                    get ':name_service/:name/properties', requirements: { name_service: ValidHostnameRegex } do
                        task = task_by_name(params[:name_service], params[:name])
                        Hash[properties: task.property_names]
                    end

                    desc "read the seleted property"
                    get ':name_service/:name/properties/:property_name/read', requirements: { name_service: ValidHostnameRegex } do
                        task = task_by_name(params[:name_service], params[:name])
                        prop = task.property(params[:property_name])
                        Hash[value: prop.raw_read.to_json_value(special_float_values: :string)]
                    end

                    desc "writes a property"
                    post ':name_service/:name/properties/:property_name/write', requirements: { name_service: ValidHostnameRegex } do
                        task = task_by_name(params[:name_service], params[:name])
                        prop = task.property(params[:property_name])

                        begin
                            obj = MultiJson.load(request.params["value"])
                        rescue MultiJson::ParseError => exception
                            error! "malformed JSON string: #{request.params["value"]}", 415
                        end

                        begin
                            return prop.write(obj["value"])
                        rescue Typelib::UnknownConversionRequested => exception
                            error! "property type mismatch", 406
                        rescue Exception => ex
                            error! "unable to write to property #{ex}", 404
                        end
                    end

                    desc "Lists all ports of the task"
                    get ':name_service/:name/ports', requirements: { name_service: ValidHostnameRegex } do
                        task = task_by_name(params[:name_service], params[:name])
                        Hash[ports: task.port_names]
                    end

                    desc "returns information about the given port"
                    get ':name_service/:name/ports/:port_name', requirements: { name_service: ValidHostnameRegex } do
                        port = port_by_task_and_name(*params.values_at('name_service', 'name', 'port_name'))
                        Hash[port: port.model.to_h]
                    end

                    desc 'read a sample on the given port and returns it'
                    params do
                        optional :timeout, type: Float, default: 2.0
                        optional :poll_period, type: Float, default: 0.05
                        optional :count, type: Integer
                        optional :binary, type: Boolean, default: false
                        optional :init, type: Boolean, default: false
                    end
                    get ':name_service/:name/ports/:port_name/read', requirements: { name_service: ValidHostnameRegex } do

                        port = get_port(*params.values_at('name_service', 'name', 'port_name', 'init', 'timeout'))
                        #port = port_by_task_and_name(*params.values_at('name_service', 'name', 'port_name'))

                        if !port.is_reader?
                            error! "#{port.name} is an input port, cannot read"
                        end

                        if Faye::WebSocket.websocket?(env)
                            port = port.port.to_async.reader(init: true, pull: true)
                            count = params.fetch(:count, Float::INFINITY)
                            ws = API.stream_async_data_to_websocket(env, port, count,params[:binary])
                            status, response = ws.rack_response
                            status status
                            response

                        else # Direct polling mode
                            count = params.fetch(:count, 1)
                            reader = port.reader
                            result = Array.new
                            (params[:timeout] / params[:poll_period]).ceil.times do
                                while sample = reader.raw_read_new
                                    if params[:binary]
                                        result << Hash[mode: :binary, value: sample.to_json_value(pack_simple_arrays: true, special_float_values: :string)]
                                    else
                                        result << Hash[value: sample.to_json_value(special_float_values: :string)]    
                                    end
                                    if result.size == count
                                        return result
                                    end
                                end
                                sleep params[:poll_period]
                            end
                            error! "did not get any sample from #{params[:name]}.#{params[:port_name]} in #{params[:timeout]} seconds", 408
                        end
                    end

                    desc "get a json value, which can be re-written to the port (no need to generate from port info)"
                    get ':name_service/:name/ports/:port_name/sample', requirements: { name_service: ValidHostnameRegex } do
                        writer = get_port(*params.values_at('name_service', 'name', 'port_name', 'timeout'))
                        if !writer.is_writer?
                            error! "#{writer.name} is an output port, cannot create a empty sample, use read instead" , 403
                        end
                        sample = writer.writer.new_sample.zero!
                        Hash[:value => sample.to_json_value]
                    end

                    desc "write a value to a port"
                    params do
                        optional :timeout, type: Integer, default: 30
                    end
                    post ':name_service/:name/ports/:port_name/write', requirements: { name_service: ValidHostnameRegex } do
                        writer = get_port(*params.values_at('name_service', 'name', 'port_name', 'timeout'))
                        if !writer.is_writer?
                            error! "#{writer.name} is an output port, cannot write" , 403
                        end

                        begin
                            obj = MultiJson.load(request.params["value"])
                        rescue MultiJson::ParseError => exception
                            error! "malformed JSON string: #{request.params["value"]}", 415
                        end

                        begin
                            writer.write(obj,params[:timeout])
                        rescue Typelib::UnknownConversionRequested => exception
                            error! "port type mismatch", 406
                        rescue Exception => ex
                            #puts ex
                            error! "unable to write to port #{ex}", 404
                        end
                    end

                    desc "write a value to a port using a ws"
                    #ws is using a get request, so we can't combine with the post url
                    #bit we can use the same, because it starts with ws://
                    get ':name_service/:name/ports/:port_name/write', requirements: { name_service: ValidHostnameRegex } do
                        if Faye::WebSocket.websocket?(env)
                            writer = get_port(*params.values_at('name_service', 'name', 'port_name'),false,0)
                            ws = Faye::WebSocket.new(env)
                            ws.on :message do |event|
                                obj = MultiJson.load(event.data)
                                writer.write(obj,0)
                            end
                            ws.on :close do
                                API.ports.soft_delete(*params.values_at('name_service', 'name', 'port_name')) 
                            end 
                            status, response = ws.rack_response
                            status status
                            response
                        end
                    end

                    desc 'connect a port, /connect&to=taskname&port=portname, optional &type=buffer&size=10'
                    params do
                        requires :to, :port
                        optional :type, type: String, default: "data"
                        optional :size, type: Integer, default: 10
                    end
                    get ':name_service/:name/ports/:port_name/connect', requirements: { name_service: ValidHostnameRegex } do
                        target = port_by_task_and_name(*params.values_at('name_service', 'to', 'port'))
                        source = port_by_task_and_name(*params.values_at('name_service', 'name', 'port_name'))                        
                        if request.params["type"] == "buffer"
                            source.connect_to target, :type => :buffer, :size => request.params["size"]
                        else
                            source.connect_to target
                        end

                    end

                    desc 'disconnect a port /disconnect&from=taskname&port=portname'
                    params do
                        requires :from, :name
                    end
                    get ':name_service/:name/ports/:port_name/disconnect', requirements: { name_service: ValidHostnameRegex } do
                        target = port_by_task_and_name(*params.values_at('name_service', 'from', 'port'))
                        source = port_by_task_and_name(*params.values_at('name_service', 'name', 'port_name'))
                        source.disconnect_from target
                    end

                    desc 'disconnect a port completely'
                    get ':name_service/:name/ports/:port_name/disconnect_all', requirements: { name_service: ValidHostnameRegex } do
                        port = port_by_task_and_name(*params.values_at('name_service', 'name', 'port_name'))
                        port.disconnect_all
                    end

                    desc 'list operations'
                    get ':name_service/:name/operations/', requirements: { name_service: ValidHostnameRegex } do
                        taskhash = Hash[task_by_name(params[:name_service], params[:name]).to_h]
                        model = taskhash[:model]
                        Hash[operations: model[:operations]]
                    end

                    desc 'get operation parameters sample'
                    get ':name_service/:name/operations/:operation/example_arguments', requirements: { name_service: ValidHostnameRegex } do
                        op = get_operation(params[:name_service], params[:name],params[:operation])
                        paramarray = Array.new
                        op.arguments_types.each do |elem|
                            entry = elem.new.zero!
                            paramarray << entry.to_json_value(special_float_values: :string)
                        end
                        Hash[:args => paramarray]
                    end

                    desc 'run operation'
                    post ':name_service/:name/operations/:operation', requirements: { name_service: ValidHostnameRegex } do
                        op = get_operation(params[:name_service], params[:name],params[:operation])

                        begin
                            obj = MultiJson.load(request.params["value"])
                        rescue MultiJson::ParseError => exception
                            error! "malformed JSON string: #{request.params["value"]}", 415
                        end

                        begin
                            params = obj["args"]
                            result=op.callop(*params)
                            if result.respond_to?(:to_json_value)
                                return result.to_json_value(special_float_values: :string);
                            else
                                return result
                            end
                        rescue Typelib::UnknownConversionRequested => exception
                            error! "argument type mismatch" , 406
                        rescue Exception => ex
                            error! "unable to write to call operation #{ex}", 404
                        end
                    end

                    desc "management for running tasks ('start', 'stop', 'configure', 'cleanup', 'reset_exception')"
                    # has to be defined after other requests e.g. ':name_service/:name/properties' or ':name_service/:name/ports'
                    # in order to be evalueated after them, otherwise this would catch the other requests and return false  
                    get ':name_service/:name/:action', requirements: { name_service: ValidHostnameRegex } do
                        task = task_by_name(params[:name_service], params[:name])
                        action = params[:action]
                        #check for allowed actions for securiry reasons
                        #otherwise all the tasks methods could be called using this interface
                        if ['start', 'stop', 'configure', 'cleanup', 'reset_exception'].include? action
                            begin
                                task.send(action)
                            rescue Orocos::StateTransitionFailed => exception
                                error! "#{exception}" ,405
                            end
                        else
                            error! "Method '#{action}' on task '#{params[:name_service]}/#{params[:name]}' is not allowed to be called using the rest api" ,405
                        end
                    end

                end
            end
        end
    end
end
