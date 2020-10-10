class UsersController < ApplicationController
    before_action :set_user, only: [:show, :edit, :update, :destroy]

    # ======= home =======
    def home
        puts "\n******* home *******"
    end

    # ======= index =======
    def index
        puts "\n******* index *******"
        @users = User.all
    end

    # ======= ======= ======= CRUD ======= ======= =======
    # ======= ======= ======= CRUD ======= ======= =======
    # ======= ======= ======= CRUD ======= ======= =======

    # ======= show =======
    def show
        puts "\n******* show *******"
    end

    # ======= new =======
    def new
        puts "\n******* new *******"
        @user = User.new
    end

    # ======= edit =======
    def edit
        puts "\n******* edit *******"
    end

    # ======= create =======
    def create
        puts "\n******* create *******"
        @user = User.new(user_params)

        respond_to do |format|
            if @user.save
                format.html { redirect_to @user, notice: "User was successfully created." }
            else
                format.html { render :new, notice: "Please try again." }
            end
        end
    end

    # ======= update =======
    def update
        puts "\n******* update *******"
        respond_to do |format|
            if @user.update(user_params)
                format.html { redirect_to @user, notice: "User was successfully updated." }
            else
                format.html { render :edit }
            end
        end
    end

    # ======= destroy =======
    def destroy
        puts "\n******* destroy *******"
        @user.destroy
        respond_to do |format|
            format.html { redirect_to "/", notice: "User was successfully destroyed." }
        end
    end

    private
        def set_user
            puts "******* set_user *******"
            @user = User.find(params[:id])
        end

        def user_params
          puts "******* user_params *******"
          params.require(:user).permit(:firstname, :lastname, :username, :password, :email)
        end

end
