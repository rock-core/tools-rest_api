module Rock
    module WebApp
        module Syskit
            # An interface client using TCP that provides reconnection capabilities
            # as well as proper formatting of the information
            class AppClient < Roby::BasicObject
                # @return [String] a string that describes the remote host
                attr_reader :remote_name
                # @return [#call] an object that can create a Client instance
                attr_reader :connection_method
                # @return [Client,nil] the socket used to communicate to the server,
                #   or nil if we have not managed to connect yet
                attr_reader :client
                # @return [Mutex] the shell requires multi-threading access, this is
                #   the mutex to protect when required
                attr_reader :mutex
    
                def initialize(remote_name, &connection_method)
                    @connection_method = connection_method
                    @remote_name = remote_name
                    @mutex = Mutex.new
                    connect
                end
    
                def path; [] end
    
                def connect(retry_period = 0.5)
                    retry_warning = false
                    begin
                        @client = connection_method.call
                    rescue Roby::Interface::ConnectionError, Roby::Interface::ComError => e
                        if retry_period
                            if e.kind_of?(Roby::Interface::ComError)
                                Roby::Interface.warn "failed handshake with #{remote_name}, retrying ..."
                            elsif !retry_warning
                                Roby::Interface.warn "cannot connect to #{remote_name}, retrying every #{retry_period} seconds..."
                                retry_warning = true
                            end
                            sleep retry_period
                            retry
                        else raise
                        end
                    end
                end
    
                def close
                    client.close
                    @client = nil
                end
    
                def actions(regex = nil, verbose = false)
                    actions = client.actions.sort_by {|act| act.name }
                    if regex
                        regex = Regexp.new(regex)
                    else
                        regex = Regexp.new(".*")
                    end
                    returnedactions = {}
                    actions.each do |action|
                        if regex.match(action.name)
                                arguments = action.arguments.sort_by {|arg| arg.name }
                                required_arguments = []
                                optional_arguments = []
                                arguments.each do |argument|
                                    if argument.required
                                        required_arguments << Hash[name: argument.name, default: argument.default, doc: argument.doc]
                                    else
                                        optional_arguments << Hash[name: argument.name, default: argument.default, doc: argument.doc]
                                    end
                                end
                            actionhash = Hash[required_arguments: required_arguments, optional_arguments: optional_arguments, doc: action.doc]
                            returnedactions[action.name] = actionhash
                        end
                    end
                    returnedactions
                end
    
    
                def jobs
                    returnedjobs = {}
                    jobs = call Hash[:retry => true], [], :jobs
                    jobs.each do |id, (state, task, planning_task)|
                        if planning_task.respond_to?(:action_model) && planning_task.action_model
                            name = "#{planning_task.action_model.to_s}(#{format_arguments(planning_task.action_arguments)})"
                        else name = task.to_s
                        end
                        jobhash = Hash[id: id, state: state.to_s]
                        returnedjobs[name] = jobhash
                    end
                    returnedjobs
                end
    
                def retry_on_com_error
                    yield
                rescue Roby::Interface::ComError
                    Roby::Interface.warn "Lost communication with remote, retrying command after reconnection"
                    connect
                    retry
                end
    
                def call(options, path, m, *args)
                    options = Kernel.validate_options options, :retry => false
                    if options[:retry]
                        options = options.merge(:retry => false)
                        retry_on_com_error do
                            return call options, path, m, *args
                        end
                    else
                        @mutex.synchronize do
                            client.call(path, m, *args)
                        end
                    end
                end
    
                # Processes the exception and job_progress queues, and yields with a
                # message that summarizes the new ones
                #
                # @param [Set] already_summarized the set of IDs of messages that
                #   have already been summarized. This should be the value returned by
                #   the last call to {#summarize_pending_messages}
                # @yieldparam [String] msg the message that summarizes the new
                #   exception/job progress
                # @return [Set] the set of notifications still in the queues that
                #   have already been summarized. Pass to the next call to
                #   {#summarize_exception}
                def summarize_pending_messages(already_summarized = Set.new)
                    summarized = Set.new
                    queues = {:exception => client.exception_queue,
                              :job_progress => client.job_progress_queue,
                              :notification => client.notification_queue}
                    queues.each do |type, q|
                        q.delete_if do |id, args|
                            summarized << id
                            if !already_summarized.include?(id)
                                msg, complete = send("summarize_#{type}", *args)
                                yield id, msg
                                complete
                            end
                        end
                    end
                    summarized
                end
    
                # Polls for messages from the remote interface and yields them. It
                # handles automatic reconnection, when applicable, as well
                #
                # It is meant to be called in a separate thread
                #
                # @yieldparam [String] msg messages for the user
                # @param [Float] period the polling period in seconds
                def notification_loop(period = 0.1)
                    already_summarized = Set.new
                    was_connected = nil
                    while true
                        mutex.synchronize do
                            has_valid_connection =
                                begin
                                    client.poll
                                    true
                                rescue Exception
                                    begin
                                        connect(nil)
                                        true
                                    rescue Exception
                                    end
                                end
    
                            already_summarized = 
                                summarize_pending_messages(already_summarized) do |id, msg|
                                    yield id, msg
                                end
                            if has_valid_connection
                                was_connected = true
                            end
    
                            if has_valid_connection && !was_connected
                                Readline.puts "reconnected"
                            elsif !has_valid_connection && was_connected
                                Readline.puts "lost connection, reconnecting ..."
                            end
                            was_connected = has_valid_connection
                        end
                        sleep period
                    end
                end
            end
        end
    end
end
