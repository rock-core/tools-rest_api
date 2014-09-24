module Rock
    module WebApp
        module Syskit
            
            class RobyAppInterface
                def initialize (syskit_url)
                    @app = Roby.app
                    @app.guess_app_dir
                    @app.shell
                    @app.single
                    @app.load_config_yaml
                    
                    error = Roby.display_exception do
                        @app.base_setup
                    
                        syskit_url ||= app.droby['host']
                        syskit_url ||= 'localhost'
                        if syskit_url !~ /:\d+$/
                            if @app.droby['host'] && @app.droby['host'] =~ /(:\d+)$/
                                syskit_url << $1
                            else
                                syskit_url << ":#{Roby::Distributed::DEFAULT_DROBY_PORT}"
                            end
                        end
                    
                        DRb.start_service
                    end
                    if error
                        exit(1)
                    end
                    
                    Roby::Distributed::DRobyModel.add_anonmodel_to_names = false
                    
                    syskit_url =~ /^(.*):(\d+)$/
                    remote_host, remote_port = $1, Integer($2)
                    @appclient = AppClient.new("#{remote_host}:#{remote_port}") do
                        Roby::Interface.connect_with_tcp_to(remote_host, remote_port)
                    end
                    
                    @messages = {}
                    Thread.new do
                        begin
                            @appclient.notification_loop(0.1) do |id, msg|
                                puts msg
                                @messages[id] = msg
                            end
                        rescue Exception => e
                            puts e
                            puts e.backtrace.join("\n")
                            #@messages.clear
                        end
                        end
                end
            
                def get_actions
                    @appclient.actions
                end
                 
                def get_jobs
                    @appclient.jobs
                end
                      
                def get_messages
                    msgs = @messages
                    #@messages.clear
                    msgs
                end
                
                def reload_actions
                    #@appclient.reload_actions
                    start_action("reload_actions",*[])
                end
                
                def start_action(m, *args)
                    puts "m"
                    puts m
                    puts "args"
                    puts args.pretty_inspect
                    path = []
                    margs = []
                    @appclient.call(Hash[:retry => true], path, m, *args)
                end
            end
            
        end
    end
end