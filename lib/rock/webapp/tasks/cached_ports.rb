module Rock
    module WebApp
        module Tasks
            class CachedPorts
                
                def initialize
                    @portentries = {} 
                end
                                        
                class PortEntry
                    
                    #if lifetiem_s ==0, there will be no timeout
                    def initialize(port, lifetime_seconds, init=false)
                        @timestamp = Time.now().to_i
                        @lifetime_s = lifetime_seconds
                        if port.respond_to?(:writer)
                            @readerwriter = port.writer
                        end
                        if port.respond_to?(:reader)
                            @readerwriter = port.reader(init: init, pull: true)
                        end
                        @port = port
                    end
                    
                    def is_writer?
                        return @port.respond_to?(:writer)
                    end
                    
                    def is_reader?
                        return @port.respond_to?(:reader)
                    end
                    
                    def name
                        @port.name
                    end
                    
                    def reader
                        @readerwriter
                    end
                    
                    def writer
                        @readerwriter
                    end
                    
                    def port
                        @port
                    end 
                    
                    def write(obj, timeout)
                        if self.connected?
                            if timeout > @lifetime_s
                                @lifetime_s = timeout
                            end
                            @timestamp = Time.now().to_i
                            @readerwriter.write(obj)
                        end
                    end
                    
                    def read(obj, timeout)
                        if self.connected?
                            if timeout > @lifetime_s
                                @lifetime_s = timeout
                            end
                            @timestamp = Time.now().to_i
                            @readerwriter.read(obj)
                        end
                    end
                    
                    def connected?
                        if @readerwriter.connected?
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
                            
                def add(port, name_service, name, port_name, init = false, lifetime_seconds = Float::INFINITY)
                    #puts "added writer with #{lifetime_seconds} timeout"
                    entry = PortEntry.new(port, lifetime_seconds, init)
                    key = name_service+name+port_name;
                    @portentries[key] = entry
                    #puts "add writer size: #{@writers.length}"
                    if lifetime_seconds < Float::INFINITY
                        create_timed_delete(lifetime_seconds, key)
                    end
                    entry
                end
                
                def get(name_service, name, port_name)
                    key = name_service+name+port_name
                    writer = @portentries[key]
                    if writer && writer.connected?
                        return writer 
                    end
                    @portentries.delete(key)
                    nil
                end
        
                def create_timed_delete(lifetime_seconds, key)
                    EM.add_timer(lifetime_seconds) do
                        writer = @portentries[key]
                        if writer #the wruiter moght have benn already deleted because it was disconnected
                            time_left = writer.lifetime_left
                            if time_left > 0
                                #puts "object has #{time_left} seconds left"
                                create_timed_delete(time_left, key)
                            else
                                #puts "deleting writer"
                                @portentries.delete(key)
                            end
                        end
                    end
                end 
                
                def delete(name_service, name, port_name)
                    key = name_service+name+port_name
                    #puts key + "disconnected, deleting"
                    @portentries.delete(key)
                end
                
            end
        end
    end
end