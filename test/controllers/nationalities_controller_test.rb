require 'test_helper'

class NationalitiesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @nationality = nationalities(:one)
  end

  test "should get index" do
    get nationalities_url
    assert_response :success
  end

  test "should get new" do
    get new_nationality_url
    assert_response :success
  end

  test "should create nationality" do
    assert_difference('Nationality.count') do
      post nationalities_url, params: { nationality: {  } }
    end

    assert_redirected_to nationality_url(Nationality.last)
  end

  test "should show nationality" do
    get nationality_url(@nationality)
    assert_response :success
  end

  test "should get edit" do
    get edit_nationality_url(@nationality)
    assert_response :success
  end

  test "should update nationality" do
    patch nationality_url(@nationality), params: { nationality: {  } }
    assert_redirected_to nationality_url(@nationality)
  end

  test "should destroy nationality" do
    assert_difference('Nationality.count', -1) do
      delete nationality_url(@nationality)
    end

    assert_redirected_to nationalities_url
  end
end
