
module Rock
    module WebApp
        module UI

            LIB_DIR = File.expand_path(File.dirname(__FILE__))
            DIR  = File.join(LIB_DIR, 'ui')
            
            if ENV['ROCK_WEBAPP_CUSTOM_PATH']
                ADDON_DIR = File.expand_path(ENV['ROCK_WEBAPP_CUSTOM_PATH'])    
            end
        end
    end
end

