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
                    
                    def expired?
                        #puts "unused #{(Time.now().to_i - @timestamp)}"
                        (Time.now().to_i - @timestamp) > @lifetime_s
                    end
                    
                end
            
                def add(port, name_service, name, port_name, lifetime_seconds)
                    #puts "added writer with #{lifetime_seconds} timeout"
                    entry = PortWriterEntry.new(port, lifetime_seconds)
                    @writers[name_service+name+port_name] = entry
                    #puts "add writer size: #{@writers.length}"
                    entry
                end
                
                def get(name_service, name, port_name )
                    writer = @writers[name_service+name+port_name]
                    if writer && writer.connected?
                        return writer 
                    end
                    nil
                end
                
                #cleans the references to the writer objects
                def clean
                    #puts "before clean writer size: #{@writers.length}"
                    @writers.delete_if do |key,elem|
                        elem.expired?
                    end
                    #puts "after clean writer size: #{@writers.length}"
                end
            end 
        end
    end
end