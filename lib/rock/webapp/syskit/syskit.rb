require 'orocos'
require 'orocos/async'

require 'grape'
require 'multi_json'
require 'faye/websocket'


require 'rock/webapp/syskit/event_loop'
require 'rock/webapp/syskit/shell_client'


# The toplevel namespace for webapp
#
# You should describe the basic idea about webapp here


module Rock
    module WebApp
        module Syskit
            LIB_DIR = File.expand_path(File.dirname(__FILE__))
            UI_DIR = File.join(LIB_DIR, 'ui')
    
            # Root for a REST API that allows to access a running Rock system
            class Root < Grape::API
                version 'v1'
    
                mount Shell
            end
        end
    end
end

