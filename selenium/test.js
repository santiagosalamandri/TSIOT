const {Builder, By, until, Key, Capabilities} = require('selenium-webdriver');
const {expect} = require('chai');
var firefox = require('selenium-webdriver/firefox');
//var profilePath = '/home/tsiot/.mozilla/firefox/zoa6kvyg.default';
var profilePath = '/home/santi/.mozilla/firefox/t4hi4k26.default-release';
let TIMEOUT=10000;
var XMLHttpRequest = require('xhr2');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
const https = require('https');

describe('test multi site with firefox', function() {
   let driver;

   const options = new firefox.Options();
   options.setProfile(profilePath);

   before(async function() {
/*      driver = new Builder().withCapabilities(
	       Capabilities.firefox().set("acceptInsecureCerts", true)
      ).build();*/
      driver = new Builder().forBrowser('firefox').
		   setFirefoxOptions(options).build();	   

   });

   it('check reset is working', async function() {
      this.timeout(TIMEOUT);
      await driver.get('https://sensor/reset');
      
      driver.findElement(By.id('action')).then(element=>{
         expect(element.text).to.equal('reset');  
      });
   });

   it('check that sitio1 does not generate hits', async function() {
      this.timeout(TIMEOUT);
      await driver.get('https://sensor/reset');
      await driver.get('https://sitio1/');
      await driver.get('https://sensor/hitcount');
      driver.findElement(By.id('count')).then(element=>{
         expect(element.text).to.equal('0');  
      });
   });

   it('check that sitio2 generates two hits', async function() {
      this.timeout(TIMEOUT);
      await driver.get('https://sensor/reset');
      await driver.get('https://sitio2/');
      await driver.get('https://sensor/hitcount');
      driver.findElement(By.id('count')).then(element=>{
         expect(element.text).to.equal('2');  
      });
   });

   it('check that there is no navigation away from sitio1', async function() {
      this.timeout(12000);
      await driver.get('https://sensor/reset');
      await driver.get('https://sitio1/');
      driver.findElement(By.id('canary')).then(element=>{
         expect(element.text).to.equal('Canario');  
      });
   });

   it('check that sitio2 only posts to form sensor without loading it', async function() {
      this.timeout(12000);
      await driver.get('https://sensor/reset');
      await driver.get('https://sitio2/');
      driver.findElement(By.id('canary')).then(element=>{
         expect(element.text).to.equal('Canario');  
      });
   });

   it('check sensor multiply GET function', async function() {
      this.timeout(12000);
      await driver.get('https://sensor/reset');
      await driver.get('https://sensor/multiply?num1=4&num2=3');
      driver.findElement(By.id('mult')).then(element=>{
         expect(element.text).to.equal('12');  
      });
   });

   it('check sensor multiply POST function', async function() {
      this.timeout(12000);
	var postData = JSON.stringify({
	    'num1' : 3,
	    'num2' : 4
	});


	var options = {
	  hostname: 'sensor',
	  port: 443,
	  path: '/multiply',
	  method: 'POST',
	  headers: {
	       'Content-Type': 'application/json',
	       'Content-Length': postData.length
	     }
	};

	var req = https.request(options, (res) => {

	  res.on('data', (d) => {	
		process.stdout.write(d);
		driver.get(d);
		driver.findElement(By.id('mult')).then(element=>{
		expect(element.text).to.equal('12');  
	});
	  });
	});

	req.on('error', (e) => {
	  console.error(e);
	});

	req.write(postData);
	req.end();


   });

   after( () =>
      driver && driver.quit()
   );
});

