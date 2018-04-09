require 'rails_helper'

RSpec.describe CategoriesController, type: :controller do
    let! (:category) { create(:category) }

    describe "#index" do

        it "should return 200 HTTP status and all categories" do
            all_categories = Category.all || []

            get "index"

            expect(response.status).to eq(200)
            expect(assigns(:categories).to_a).to eq(all_categories)
        end

        it "should return a json response with categories" do
            categories = Category.all || []

            get :index, { format: :json }

            json_response = JSON.parse(response.body)
            json_response_category = json_response["categories"].first["name"]

            expect(json_response_category).to eq(categories.first.name)
        end
    end

    describe "#show" do
        it "should retrieve requested record" do
            get :show, params: { id: category.id }, format: :json

            category_response = JSON.parse(response.body)
            expect(category_response["category"]["name"]).to eq(category.name)
        end

        it "returns error for non-existent category" do
            get :show, params: { id: 1000 }, format: :json

            category_response = JSON.parse(response.body)
            expect(category_response["errors"]).to eq("Category not found")
        end
    end

    describe "#update" do
        it "should update category name" do
            category = Category.first
            update_params = { name: "Updated title" }

            put :update, params: { id: category.id, category: update_params }, format: :json

            category.reload
            expect(response.status).to eq(200)
            expect(category.name).to eq("Updated title")
        end
    end

    describe "#destroy" do
        it "should delete category" do
            expect { delete :destroy, params: {id: category.id}, format: :json }
                .to change { Category.count }.by(-1)
        end
    end
    
end
