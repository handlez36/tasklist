class CategoriesController < ApplicationController
  before_action :find_category, only: [:show, :update, :destroy]

  def index
    @categories = Category.all || []

    respond_to do |format|
      format.html {}
      format.json { render json: { categories: @categories } }
    end
  end

  def show
    respond_to do |format|
      format.html {}
      format.json do
        @category ?
          response = { category: @category } :
          response = { errors: "Category not found" }

        render json: response
      end
    end
  end

  def update
    respond_to do |format|
      format.html {}
      format.json do
        if @category
          @category.update_attributes category_params
          response = { category: @category }
        else
          response = { errors: "Category not updated" }
        end

        render json: response
      end
    end
  end

  def destroy
    respond_to do |format|
      format.html {}
      format.json do
        if @category
          @category.destroy
          response = { success: true }
        else
          response = { success: false }
        end

        render json: response
      end
    end
  end

  private

  def find_category
    @category = Category.find_by(id: params[:id])
  end

  def category_params
    params
      .require(:category)
      .permit(:name, :description, :color)
  end
end
