<script>
  // core components
  import CardStats from "components/Cards/CardStats.svelte";
  import fetch from 'isomorphic-unfetch'
  import {navigate} from "svelte-routing";





  const fetchDataBtc = (async () => {
    const response = await fetch('https://data.messari.io/api/v1/assets/btc/metrics',{
      headers:{"x-messari-api-key":"de4cda7f-e4df-4e77-a476-0120085fb840"}
    });
    return response.json();
  })()
  const fetchDataEth = (async () => {
    const response = await fetch('https://data.messari.io/api/v1/assets/eth/metrics',{
      headers:{"x-messari-api-key":"de4cda7f-e4df-4e77-a476-0120085fb840"}
    });
    return response.json();
  })()
  const fetchDataUsdt = (async () => {
    const response = await fetch('https://data.messari.io/api/v1/assets/usdt/metrics',{
      headers:{"x-messari-api-key":"de4cda7f-e4df-4e77-a476-0120085fb840"}
    });
    return response.json();
  })()
  const fetchDataLite = (async () => {
    const response = await fetch('https://data.messari.io/api/v1/assets/litecoin/metrics',{
      headers:{"x-messari-api-key":"de4cda7f-e4df-4e77-a476-0120085fb840"}
    });
    return response.json();
  })()
  const test = Promise.all([fetchDataBtc,fetchDataEth,fetchDataUsdt,fetchDataLite]);



  // window.addEventListener('load', function() {
  //   const status = document.getElementById("status");
  //   const log = document.getElementById("log");
  //
  //   function updateOnlineStatus(event) {
  //     // let condition = navigator.onLine ? "online" : "offline";
  //     //
  //     // status.className = condition;
  //     // status.innerHTML = condition.toUpperCase();
  //     //
  //     // log.insertAdjacentHTML("beforeend", "Event: " + event.type + "; Status: " + condition);
  //     if(!navigator.onLine) {
  //       navi();
  //     }
  //   }
  //
  //   window.addEventListener('online',  updateOnlineStatus);
  //   window.addEventListener('offline', updateOnlineStatus);
  // });

  // function navi() {
  //   navigate("/200.html", { replace: true });
  // }
</script>

{#await test}
{:then [dataBtc,dataEth,dataUsdt,dataLite]}
<div class="relative md:pt-32 md:pb-32 mb-4">

  <div class="px-4 md:px-10 mx-auto w-full">
    <div>
      <!-- Card stats -->
      <div class="flex flex-wrap">
        <div class="w-full lg:w-6/12 xl:w-3/12 px-4">

          <CardStats
            statSubtitle="BITCOIN"
            statTitle="${dataBtc.data.market_data.price_usd.toString().substr(0,8)}"
            statArrow="{dataBtc.data.market_data.percent_change_usd_last_24_hours.toString().startsWith('-') === true ? 'down' : 'up' } "
            statPercent="{dataBtc.data.market_data.percent_change_usd_last_24_hours.toString().substr(0,5)}"
            statPercentColor="{dataBtc.data.market_data.percent_change_usd_last_24_hours.toString().startsWith('-') === true ? 'text-red-500' : 'text-emerald-500' } "
            statDescripiron="{new Date(Date.parse(dataBtc.data.market_data.last_trade_at.toString())).toLocaleString()}"
            statIconName="far fa-chart-bar"
            statIconColor="bg-red-500"
            />
        </div>
        <div class="w-full lg:w-6/12 xl:w-3/12 px-4">
          <CardStats
            statSubtitle="ETHEREUM"
            statTitle="${dataEth.data.market_data.price_usd.toString().substr(0,8)}"
            statArrow="{dataEth.data.market_data.percent_change_usd_last_24_hours.toString().startsWith('-') === true ? 'down' : 'up' } "
            statPercent="{dataEth.data.market_data.percent_change_usd_last_24_hours.toString().substr(0,5)}"
            statPercentColor="{dataEth.data.market_data.percent_change_usd_last_24_hours.toString().startsWith('-') === true ? 'text-red-500' : 'text-emerald-500' } "
            statDescripiron="{new Date(Date.parse(dataEth.data.market_data.last_trade_at.toString())).toLocaleString()}"
            statIconName="fas fa-chart-bar"
            statIconColor="bg-orange-500"
          />
        </div>
        <div class="w-full lg:w-6/12 xl:w-3/12 px-4">
          <CardStats
            statSubtitle="USDT"
            statTitle="${dataUsdt.data.market_data.price_usd.toString().substr(0,8)}"
            statArrow="{dataUsdt.data.market_data.percent_change_usd_last_24_hours.toString().startsWith('-') === true ? 'down' : 'up' } "
            statPercent="{dataUsdt.data.market_data.percent_change_usd_last_24_hours.toString().substr(0,5)}"
            statPercentColor="{dataUsdt.data.market_data.percent_change_usd_last_24_hours.toString().startsWith('-') === true ? 'text-red-500' : 'text-emerald-500' } "
            statDescripiron="{new Date(Date.parse(dataUsdt.data.market_data.last_trade_at.toString())).toLocaleString()}"
            statIconName="fas fa-chart-bar"
            statIconColor="bg-pink-500"
          />
        </div>
        <div class="w-full lg:w-6/12 xl:w-3/12 px-4">
          <CardStats
            statSubtitle="LITECOIN"
            statTitle="${dataLite.data.market_data.price_usd.toString().substr(0,8)}"
            statArrow="{dataLite.data.market_data.percent_change_usd_last_24_hours.toString().startsWith('-') === true ? 'down' : 'up' } "
            statPercent="{dataLite.data.market_data.percent_change_usd_last_24_hours.toString().substr(0,5)}"
            statPercentColor="{dataLite.data.market_data.percent_change_usd_last_24_hours.toString().startsWith('-') === true ? 'text-red-500' : 'text-emerald-500' } "
            statDescripiron="{new Date(Date.parse(dataLite.data.market_data.last_trade_at.toString())).toLocaleString()}"
            statIconName="fas fa-chart-bar"
            statIconColor="bg-emerald-500"
          />
        </div>
      </div>
    </div>
  </div>
</div>

{/await}