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
        LIB_DIR = File.expand_path(File.dirname(__FILE__))
        UI_DIR  = File.join(LIB_DIR, 'webapp', 'ui')
        if ENV['ROCK_WEBAPP_CUSTOM_PATH']
            UI_CUSTOM_DIR = File.expand_path(ENV['ROCK_WEBAPP_CUSTOM_PATH'])    
        end

        extend Logger::Root('Rock::WebApp', Logger::WARN)

        # Root for a REST API that allows to access a running Rock system
        class Root < Grape::API
            version 'v1'

            mount Tasks
        end
    end
end

