class Users::OmniauthCallbacksController < ApplicationController
    def facebook
        @user = User.first

        if @user.persisted?
            puts "In facebook callback!!!"
            sign_in @user
        end
    end

    def failure
        redirect_to root_path
    end
end
