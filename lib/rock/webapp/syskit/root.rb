require 'orocos'
require 'orocos/async'

require 'grape'
require 'multi_json'
require 'faye/websocket'

require 'rock/webapp/syskit/api'
require 'rock/webapp/syskit/event_loop'

# The toplevel namespace for webapp
#
# You should describe the basic idea about webapp here


module Rock
    module WebApp
        module Syskit   
            # Root for a REST API that allows to access a running Rock system
            class Root < Grape::API
                version 'v1'
    
                mount API
            end
        end
    end
end

