const { PanelView } = require("custom-jetpack-panelview");
const { ToggleButton } = require('sdk/ui');
const Request = require("sdk/request").Request;
const workaround = require("custom-jetpack-panelview/lib/panelview/workaround");
const tabs = require("sdk/tabs");
const name = "lightweightThemes.selectedThemeID";
const selectedThemeID = require("sdk/preferences/service").get(name);
const preferences = require("sdk/simple-prefs");
var pv = PanelView({
        id: 'holytransaction-panelview',
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
  id: "holytransaction-button",
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
                price = 1/price;
                if (currency[1] === pair && preferences.prefs[currency[0]])
                content.push(
                  {
                      type: 'rate',
                      currency: currency[0],
                      pair: pair,
                      price: formatter.format(price)
                  }
                );
              }
              pv.content = content;
            }
          }).get();
          pv.show(button);
        }
    }
});

pv.on("hide", () => {
    button.state("window", {checked: false});
});

workaround.applyButtonFix(button);
