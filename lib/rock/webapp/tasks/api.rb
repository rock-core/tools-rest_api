require 'rock/webapp/tasks/cached_ports'

module Rock
    module WebApp
        module Tasks    
            
            class API < Grape::API
                version 'v1', using: :header, vendor: :rock
                format :json
    
                
                @ports = CachedPorts.new
                
                def self.ports
                    @ports
                end
                
                
                def self.stream_async_data_to_websocket(env, data_source, count = Float::INFINITY, binary = false)
                    emitted_samples = 0
    
                    # Asynchronous streaming mode
                    ws = Faye::WebSocket.new(env)
    
                    listener = data_source.on_raw_data do |sample|
                        result = Array.new
                        if binary
                            result << Hash[:mode => :binary, :value => sample.to_json_value(:pack_simple_arrays => true, :special_float_values => :string)]
                        else
                            result << Hash[:value => sample.to_json_value(:special_float_values => :string)]    
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
                            Orocos.name_service.get "#{name_service}/#{name}"
                        rescue Orocos::NotFound
                            error! "cannot find #{name_service}/#{name} on the registered name services", 404
                        end
    
                        def port_by_task_and_name(name_service, name, port_name)
                            task_by_name(name_service, name).port(port_name)
                        rescue Orocos::NotFound
                            error! "cannot find port #{port_name} on task #{name_service}/#{name}", 404
                        end
                        
                        def get_port(name_service, name, port_name, timeout)
                            portentry = API.ports.get(name_service, name, port_name)
                            if !portentry
                                port = port_by_task_and_name(name_service, name, port_name)
                                portentry = API.ports.add(port, name_service, name, port_name,timeout)
                            end
                            portentry
                        end
                        
                    end
    
                    desc "Lists information about a given task"
                    get ':name_service/:name' do
                        Hash[task: task_by_name(params[:name_service], params[:name]).to_h]
                    end
    
                    desc "Lists all ports of the task"
                    get ':name_service/:name/ports' do
                        task = task_by_name(params[:name_service], params[:name])
                        ports = task.each_port.map(&:model)
                        Hash[ports: ports.map(&:to_h)]
                    end
    
                    desc "returns information about the properties of a given task"
                    get ':name_service/:name/properties' do
                        taskhash = Hash[task_by_name(params[:name_service], params[:name]).to_h]
                        model = taskhash[:model]
                        Hash[properties: model[:properties]]
                    end
                                    
                    desc "returns information about the seleted property"
                    get ':name_service/:name/properties/:property_name/read' do
                        task = task_by_name(params[:name_service], params[:name])
                        prop = task.property(params[:property_name])
                        puts prop.raw_read_new.pretty_inspect
                        #puts prop.to_h
                        Hash[value: prop.raw_read.to_json_value(:special_float_values => :string)]
                    end
                    
                    desc "returns information about the given port"
                    get ':name_service/:name/ports/:port_name' do
                        port = port_by_task_and_name(*params.values_at('name_service', 'name', 'port_name'))
                        Hash[port: port.model.to_h]
                    end
    
                    desc 'read a sample on the given port and returns it'
                    params do
                        optional :timeout, type: Float, default: 2.0
                        optional :poll_period, type: Float, default: 0.05
                        optional :count, type: Integer
                        optional :binary, type: String, default: "false"
                    end
                    get ':name_service/:name/ports/:port_name/read' do
                        
                        port = get_port(*params.values_at('name_service', 'name', 'port_name', 'timeout'))
                        #port = port_by_task_and_name(*params.values_at('name_service', 'name', 'port_name'))
    
                        if !port.is_reader?
                            error! "#{port.name} is an input port, cannot read"
                        end
                        
                        if Faye::WebSocket.websocket?(env)
                            port = port.port.to_async.reader(init: true, pull: true)
                            count = params.fetch(:count, Float::INFINITY)
                            if params[:binary] == "false"
                                ws = API.stream_async_data_to_websocket(env, port, count)
                            else
                                ws = API.stream_async_data_to_websocket(env, port, count, true)
                            end
    
                            status, response = ws.rack_response
                            status status
                            response
                            
                        else # Direct polling mode
                            count = params.fetch(:count, 1)
                            reader = port.reader
                            result = Array.new
                            (params[:timeout] / params[:poll_period]).ceil.times do
                                while sample = reader.raw_read_new
                                    if params[:binary] == "false"
                                        result << Hash[:value => sample.to_json_value(:special_float_values => :string)]
                                    else
                                        result << Hash[:mode => :binary, :value => sample.to_json_value(:pack_simple_arrays => true, :special_float_values => :string)]    
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
                    
                                       
                    desc "write a value to a port"
                    params do
                        optional :timeout, type: Integer, default: 30
                    end
                    post ':name_service/:name/ports/:port_name/write' do
 
                        writer = get_port(*params.values_at('name_service', 'name', 'port_name', 'timeout'))
    
                        if !writer.is_writer?
                            error! "#{port.name} is an output port, cannot write" , 403
                        end 
                        
                        begin
                            obj = MultiJson.load(request.params["value"])
                        rescue MultiJson::ParseError => exception
                            error! "malformed JSON string", 415
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
                    get ':name_service/:name/ports/:port_name/write' do
                        
                        if Faye::WebSocket.websocket?(env)
                            writer = get_port(*params.values_at('name_service', 'name', 'port_name'),0)
                            ws = Faye::WebSocket.new(env)
                            ws.on :message do |event|
                                obj = MultiJson.load(event.data)
                                writer.write(obj,0)
                            end
                            ws.on :close do
                                API.ports.delete(*params.values_at('name_service', 'name', 'port_name')) 
                            end 
                            status, response = ws.rack_response
                            status status
                            response
                        end
                        
                    end
                end
            end
        end
    end
end