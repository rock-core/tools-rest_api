module Rock
    module WebApp
        module Tasks
            class CachedPorts
                
                def initialize
                    @portentries = {}
                    @timer = nil
                end
                                        
                class PortEntry
                    attr_accessor :timer
                    
                    #if timeout ==0, there will be no timeout
                    def initialize(port, timeout, init=false)
                        
                        @end_lifetime = Time.at(Time.now.to_i + timeout.to_i)
                        
                        #puts "new port will time out at #{@end_lifetime}"
                        
                        if port.respond_to?(:writer)
                            @writer = port.writer
                        end
                        if port.respond_to?(:reader)
                            @reader = port.reader(init: init, pull: true)
                        end
                        
                        @port = port
                    end
                    
                    def is_writer?
                        @port.respond_to?(:writer)
                    end
                    
                    def is_reader?
                        @port.respond_to?(:reader)
                    end
                    
                    def name
                        @port.name
                    end
                    
                    def reader
                        @reader
                    end
                    
                    def writer
                        @writer
                    end
                    
                    def port
                        @port
                    end 
                    
                    def timer=(value)
                        @timer=value
                    end
                    
                    def write(obj, timeout)
                        if self.connected?
                            new_end = Time.at(Time.now.to_i + timeout.to_i)
                            #puts "old:\t#{@end_lifetime}\nnew:\t#{new_end}"
                            if new_end > @end_lifetime
                                @end_lifetime = new_end
                                #puts "existing write port will now time out at #{@end_lifetime}"
                            end
                            @writer.write(obj)
                        end
                    end
                    
                    def read(obj, timeout)
                        if self.connected?
                            new_end = Time.at(Time.now.to_i + timeout.to_i)
                            if new_end > @end_lifetime
                                @end_lifetime = new_end
                                #puts "existing read port will now time out at #{@end_lifetime}"
                            end
                            @reader.read(obj)
                        end
                    end
                    
                    def reader_or_writer
                        @reader || @writer
                    end
                    
                    def connected?
                        if reader_or_writer.connected?
                            return true
                        else
                            @end_lifetime = Time.at(0) #start of epoch, definately tiimed out
                            return false
                        end
                    end
                    
                    def lifetime_left
                        return @end_lifetime - Time.now
                    end
                    
                end
                            
                #timeout == 0 won't start a timer to delete the port
                def add(port, name_service, name, port_name, init = false, timeout)
                    #puts "added writer with #{timeout} timeout"
                    entry = PortEntry.new(port, timeout, init)
                    key = name_service+name+port_name;
                    @portentries[key] = entry
                    #puts "add writer size: #{@writers.length}"
                    if timeout > 0
                        create_timed_delete(timeout, key)
                    end
                    entry
                end
                
                #timeout == 0 will cancel the running EM timer (re-started at delete)
                def get(name_service, name, port_name, timeout)
                    key = name_service+name+port_name
                    port = @portentries[key]
                    if port && port.connected?
                        if timeout == 0
                            #puts "cancelling timer"
                            EM.cancel_timer(port.timer)
                            port.timer=nil
                        end
                        return port 
                    end
                    @portentries.delete(key)
                    nil
                end
        
                #can take Interger of Time as timeout arg
                def create_timed_delete(timeout, key)
                    mtimer = EM.add_timer(timeout.to_i) do
                        port = @portentries[key]
                        if port #the writer might have been already deleted because it was disconnected
                            time_left = port.lifetime_left
                            if time_left > 0
                                #puts "object has #{time_left} seconds left, #{Time.now}"
                                create_timed_delete(time_left, key)
                            else
                                #puts "timed delete writer #{Time.now}"
                                @portentries.delete(key)
                            end
                        end
                    end
                    port = @portentries[key]
                    port.timer = mtimer
                end 
                
                # don't delete if there is lifetime left
                # this may happen, when the port was initially created withpout lifetime (user delete)
                # but used by another part with a timeout
                def soft_delete(name_service, name, port_name)
                    key = name_service+name+port_name
                    #puts key + "soft deleting #{Time.now}"
                    port = @portentries[key]
                    if port && port.lifetime_left > 0
                        create_timed_delete(port.lifetime_left, key)
                        #puts key + "soft deleting #{Time.now} new timer #{port.lifetime_left}"
                    else
                        @portentries.delete(key)
                    end
                end
                
                #force-delete a port, no matter if there are pending timeouts
                def delete(name_service, name, port_name)
                    key = name_service+name+port_name
                    #puts key + "deleting #{Time.now}"
                    @portentries.delete(key)
                end
                
            end
        end
    end
end