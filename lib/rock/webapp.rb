require 'orocos'
require 'orocos/async'

require 'grape'
require 'multi_json'
require 'faye/websocket'

require 'rock/webapp/event_loop'
require 'rock/webapp/tasks'

# The toplevel namespace for webapp
#
# You should describe the basic idea about webapp here
require 'utilrb/logger'
module Rock
    module WebApp
        extend Logger::Root('Rock::WebApp', Logger::WARN)

        # Root for a REST API that allows to access a running Rock system
        class Root < Grape::API
            version 'v1'

            mount Tasks
        end
    end
end

