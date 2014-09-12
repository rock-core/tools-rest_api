require 'orocos'
require 'orocos/async'

require 'grape'
require 'multi_json'
require 'faye/websocket'

require 'rock/webapp/tasks/api'
require 'rock/webapp/tasks/event_loop'

# The toplevel namespace for webapp
#
# You should describe the basic idea about webapp here
require 'utilrb/logger'
module Rock
    module WebApp
        module Tasks
            extend Logger::Root('Rock::WebApp', Logger::WARN)
    
            # Root for a REST API that allows to access a running Rock system
            class Root < Grape::API
                version 'v1'
    
                mount API
            end
        end
    end
end

