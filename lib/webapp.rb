require 'webapp/webapp'
require 'webapp/base'

# The toplevel namespace for webapp
#
# You should describe the basic idea about webapp here
require 'utilrb/logger'
module Webapp
    extend Logger::Root('Webapp', Logger::WARN)
end

