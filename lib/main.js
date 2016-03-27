const { PanelView } = require("custom-jetpack-panelview");
const { ToggleButton } = require('sdk/ui');
const Request = require("sdk/request").Request;
const workaround = require("custom-jetpack-panelview/lib/panelview/workaround");
const tabs = require("sdk/tabs");
const name = "lightweightThemes.selectedThemeID";
const selectedThemeID = require("sdk/preferences/service").get(name);
const preferences = require("sdk/simple-prefs");
var pv = PanelView({
        id: 'ubuntuve-panelview',
        title: 'Exchange rates',
        content: [
          {
              type: 'spinner'
          }
        ],
        footer: {
            label: 'Web App',
            onClick: function(event) {
                tabs.open("https://holytransaction.com/app");
            }
        }
    });


const button = ToggleButton({
  id: "ubuntuve-button",
  label: "HolyTransaction",
  icon: {
    "16": selectedThemeID === "firefox-devedition@mozilla.org" ?
      "./icondev16.svg" : "./icon16.svg",
    "32": "./icon32.svg",
    "64": "./icon64.svg"
  },
    onClick(state){
        if(state.checked) {
          var locale = require("sdk/preferences/service")
                        .get("general.useragent.locale");
          var formatter = new Intl.NumberFormat(locale, {
            minimumFractionDigits: preferences.prefs.decimals,
            maximumFractionDigits: preferences.prefs.decimals
          });
          Request({
            url: "https://api.holytransaction.com/api/v1/data/exchange_rates?show_fiat=1",
            onComplete: function (response) {
              var exchange_rates = response.json;
              var content = [];
              for (var prop in exchange_rates) {
                var currency = prop.split('-');
                var pair = preferences.prefs.pair;
                var price = parseFloat(exchange_rates[prop]);
                //price = price.toFixed(preferences.prefs.decimals);
                if (currency[0] === pair && eval("preferences.prefs." + currency[1]))
                content.push(
                  {
                      type: 'rate',
                      currency: currency[1],
                      pair: pair,
                      price: formatter.format(price)
                  }
                );
              }
              pv.content = content;
              // {
              //   "BTC-LTC": "126.9170299339",
              //   "BTC-USD": "408.1798",
              //   "BTC-PPC": "840.6856455142",
              //   "BTC-DOGE": "1882352.9411764704",
              //   "BTC-DASH": "56.5389973364",
              //   "BTC-BC": "11941.7838039561",
              //   "BTC-RBR": "563218.3908045977",
              //   "BTC-GRC": "35995.5005624294",
              //   "BTC-EUR": "366.6964",
              // }
            }
          }).get();
          pv.show(button);
        }
    }
});

// Uncheck the button if the panel is hidden by loosing focus
pv.on("hide", () => {
    button.state("window", {checked: false});
});

// Don't close the menu panel or overflow panel when the button is clicked.
workaround.applyButtonFix(button);
