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
                    
                    #if lifetiem_s ==0, there will be no timeout
                    def initialize(port, timeout, init=false)
                        
                        @end_lifetime = Time.at(Time.now + timeout)
                        
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
                            new_end = Time.at(Time.now + timeout)
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
                            new_end = Time.at(Time.now + timeout)
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
                    port_entry = PortEntry.new(port, timeout, init)
                    key = generate_key(name_service, name, port_name)
                    @portentries[key] = port_entry
                    #puts "add writer size: #{@writers.length}"
                    if timeout > 0
                        create_timed_delete(timeout, port_entry)
                    end
                    port_entry
                end
                
                #timeout == 0 will cancel the running EM timer (re-started at delete)
                def get(name_service, name, port_name, timeout)
                    key = generate_key(name_service, name, port_name)
                    port_entry = @portentries[key]
                    if port_entry && port_entry.connected?
                        if timeout == 0
                            #puts "cancelling timer"
                            EM.cancel_timer(port_entry.timer)
                            port_entry.timer=nil
                        end
                        return port_entry 
                    else
                        @portentries.delete(key)
                        return nil
                    end
                end
        
                #can take Interger of Time as timeout arg
                def create_timed_delete(timeout, port_entry)
                    mtimer = EM.add_timer(timeout.to_i) do
                        time_left = port_entry.lifetime_left
                        if time_left > 0
                            #puts "object has #{time_left} seconds left, #{Time.now}"
                            create_timed_delete(time_left, port_entry)
                        else
                            #puts "timed delete writer #{Time.now}"
                            @portentries.delete(@portentries.key(port_entry))
                        end
                    end
                    port_entry.timer = mtimer
                end 
                
                # don't delete if there is lifetime left
                # this may happen, when the port was initially created withpout lifetime (user delete)
                # but used by another part with a timeout
                def soft_delete(name_service, name, port_name)
                    key = generate_key(name_service, name, port_name)
                    #puts key + "soft deleting #{Time.now}"
                    port_entry = @portentries[key]
                    if port_entry && port_entry.lifetime_left > 0
                        create_timed_delete(port_entry.lifetime_left, port_entry)
                        #puts key + "soft deleting #{Time.now} new timer #{port_entry.lifetime_left}"
                    else
                        @portentries.delete(key)
                    end
                end
                
                #force-delete a port, no matter if there are pending timeouts
                def delete(name_service, name, port_name)
                    key = generate_key(name_service, name, port_name)
                    #puts key + "deleting #{Time.now}"
                    @portentries.delete(key)
                end
                
                def generate_key(name_service, name, port_name)
                    name_service+name+port_name
                end
                
            end
        end
    end
end