class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
    def facebook
        @user = User.from_omniauth(request.env["omniauth.auth"]) if request.env["omniauth.auth"].present?
        require 'pry'; binding.pry
        if @user.persisted?
            require 'pry'; binding.pry
            sign_in_and_redirect @user
        end
    end

    def failure
        redirect_to root_path
    end
end
