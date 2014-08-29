

require 'roby'
require 'roby/distributed'
require 'optparse'
require 'utilrb/readline'
require 'rock/webapp/syskit/app_client' 


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
                    @appclient = Roby::Interface::AppClient.new("#{remote_host}:#{remote_port}") do
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
                
                def start_action(m, *args)
                    puts "m"
                    puts m
                    puts "args"
                    puts args.pretty_inspect
                    path = []
                    margs = []
                    @appclient.call(Hash[:retry => true], path, m, *margs)
                end
            end
            
            
            class Shell < Grape::API
                version 'v1', using: :header, vendor: :rock
                format :json
                
                syskit_url = "localhost:#{Roby::Distributed::DEFAULT_DROBY_PORT}"
                interface = RobyAppInterface.new(syskit_url) 

                resource :actions do
                    
                    desc "Lists all tasks that are currently reachable on the name services"
                    get do
                        interface.get_actions
                    end
                    
                    get ':action/start' do
                        puts "start #{params.values_at('action')}" 
                        interface.start_action(params[:action],*params)
                    end
                        
                     
                end
                
                resource :jobs do
                    
                    desc "Lists all tasks that are currently reachable on the name services"
                    get do
                        interface.get_jobs
                    end 
                end
                resource :msg do
                    
                    desc "Lists all tasks that are currently reachable on the name services"
                    get do
                        interface.get_messages
                    end 
                end             
            end    
        end 
    end
end
   

