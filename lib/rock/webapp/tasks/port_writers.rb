module Rock
    module WebApp
        module Tasks
            class PortWriters
                
                def initialize
                    @writers = {} 
                end
                                        
                class PortWriterEntry
                                
                    def initialize(port, lifetime_seconds)
                        @timestamp = Time.now().to_i
                        @lifetime_s = lifetime_seconds
                        @writer = port.writer
                        @port = port
                    end
                    
                    def write(obj, timeout)
                        if self.connected?
                            if timeout > @lifetime_s
                                @lifetime_s = timeout
                            end
                            @timestamp = Time.now().to_i
                            @writer.write(obj)
                        end
                    end
                    
                    def connected?
                        if @writer.connected?
                            return true
                        else
                            @lifetime_s = 0
                            return false
                        end
                    end
                    
                    def lifetime_left
                        @lifetime_s - (Time.now().to_i - @timestamp)  
                    end
                    
                end
                            
                def add(port, name_service, name, port_name, lifetime_seconds)
                    #puts "added writer with #{lifetime_seconds} timeout"
                    entry = PortWriterEntry.new(port, lifetime_seconds)
                    key = name_service+name+port_name;
                    @writers[key] = entry
                    #puts "add writer size: #{@writers.length}"
                    create_timed_delete(lifetime_seconds, key)
                    entry
                end
                
                def get(name_service, name, port_name )
                    key = name_service+name+port_name
                    writer = @writers[key]
                    if writer && writer.connected?
                        return writer 
                    end
                    @writers.delete(key)
                    nil
                end
        
                def create_timed_delete(lifetime_seconds, key)
                    EM.add_timer(lifetime_seconds) do
                        writer = @writers[key]
                        if writer #the wruiter moght have benn already deleted because it was disconnected
                            time_left = writer.lifetime_left
                            if time_left > 0
                                #puts "object has #{time_left} seconds left"
                                create_timed_delete(time_left, key)
                            else
                                #puts "deleting writer"
                                @writers.delete(key)
                            end
                        end
                    end
                end 
                
            end
        end
    end
end