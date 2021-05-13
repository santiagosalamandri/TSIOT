require "selenium-webdriver"
require "rspec"


describe "testbench" do
  context "" do

    before(:all) {
        options = Selenium::WebDriver::Firefox::Options.new
        #options.profile = "default"
        options.profile = "default-release"
        @driver  = Selenium::WebDriver.for :firefox, options: options
    }

#    after(:all) {
#        @driver.quit
#    }

    it "check reset is working" do
        @driver.navigate.to "https://sensor/reset"
        element = @driver.find_element(id: 'action')
        expect(element.text).to eq("reset");

        @driver.navigate.to "https://sensor/hitcount" 
        count = @driver.find_element(id: 'count');
        expect(count.text).to eq("0");
    end

    it "check that sitio1 does not generate hits" do
        @driver.navigate.to "https://sensor/reset"
        @driver.navigate.to "https://sitio1/"
        @driver.navigate.to "https://sensor/hitcount" 
        count = @driver.find_element(id: 'count');
        expect(count.text).to eq("0");
    end

    it "check that sitio2 generates two hits" do
        @driver.navigate.to "https://sensor/reset"
        @driver.navigate.to "https://sitio2/"
        @driver.navigate.to "https://sensor/hitcount" 
        count = @driver.find_element(id: 'count');
        expect(count.text).to eq("2");
    end

    it "check that there is no navigation away from sitio1" do
        @driver.navigate.to "https://sensor/reset"
        @driver.navigate.to "https://sitio1/"
        element = @driver.find_element(id: 'canary');
        expect(element.text).to eq("Canario"); 
    end

    it "check that sitio2 only posts to form sensor without loading it" do
        @driver.navigate.to "https://sensor/reset"
        @driver.navigate.to "https://sitio2/"
        element = @driver.find_element(id: 'canary');
        expect(element.text).to eq("Canario"); 
    end

  end
end

