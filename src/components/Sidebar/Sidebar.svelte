<script>
  import { link } from "svelte-routing";
  import { purses, Purse } from "../../lib/purses";

  // core components
  let collapseShow = "hidden";


  function toggleCollapseShow(classes) {
    collapseShow = classes;
  }
 for( let pi in $purses.filter((p) => p.currency === "regular")){
   Purse.updatePurseByTitle(pi.title, (pi) =>  {
     pi.expenses = [];
   })
 }

  window.onload = () => {
          const el = document.getElementById("Capa_1");
          el.addEventListener("mouseover", () => {
              el.style.transform = "scale(1.2";
          });
          el.addEventListener('mouseout', () => {
            el.style.transform = "scale(1)";
          });}




  export let location;

</script>

<nav
  class="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-xl bg-white flex flex-wrap items-center justify-between relative md:w-64 z-10 py-4 px-6"
>
  <div
    class="md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto"
  >
    <!-- Toggler -->
    <button
      class="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
      type="button"
      on:click={() => toggleCollapseShow("bg-white m-2 py-3 px-6")}
    >
      <i class="fas fa-bars"></i>
    </button>
    <!-- Brand -->
    <a
      use:link
      class="md:block text-left md:pb-2 text-blueGray-600 mr-0 inline-block whitespace-nowrap text-lg uppercase font-bold p-4 px-0"
      href="/admin/dashboard"
    >
      <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
           viewBox="0 0 512 512" xml:space="preserve" width="15" height="15" class="inline" >
<path style="fill:#FFB125;" d="M446.908,175.275H45.647c-9.906,0-17.936,8.03-17.936,17.936v48.18h437.134v-48.18
	C464.844,183.306,456.814,175.275,446.908,175.275z"/>
        <path style="fill:#B6FA4C;" d="M301.231,75.667l-36.338,367.865c-0.913,9.241-9.144,15.992-18.385,15.079l-184.12-18.188
	c-9.241-0.913-15.992-9.144-15.079-18.385L83.647,54.174c0.913-9.241,9.144-15.992,18.385-15.079l184.12,18.188
	C295.392,58.195,302.143,66.426,301.231,75.667z"/>
        <path style="fill:#A8E83A;" d="M286.152,57.282l-184.12-18.188c-9.241-0.913-17.472,5.838-18.385,15.079l-3.26,33.004
	c2.762-1.403,5.937-2.074,9.248-1.747l184.12,18.188c9.241,0.913,15.992,9.144,15.079,18.385l-33.078,334.862
	c4.945-2.512,8.551-7.403,9.136-13.332L301.23,75.668C302.144,66.426,295.392,58.195,286.152,57.282z"/>
        <path style="fill:#77DD00;" d="M103.162,106.336L76.653,374.703c-0.379,3.841,1.429,7.585,4.705,9.627
	c9.027,5.628,16.017,14.071,19.858,23.984c1.381,3.563,4.679,6.02,8.481,6.396l95.447,9.428c3.802,0.376,7.518-1.389,9.568-4.613
	c5.706-8.969,14.213-15.882,24.167-19.635c3.612-1.362,6.118-4.679,6.497-8.52l26.509-268.367c0.379-3.841-1.429-7.585-4.705-9.627
	c-9.027-5.628-16.017-14.071-19.858-23.984c-1.381-3.562-4.679-6.02-8.481-6.396l-95.447-9.428
	c-3.802-0.376-7.518,1.389-9.568,4.613c-5.706,8.969-14.213,15.882-24.167,19.635C106.048,99.178,103.542,102.495,103.162,106.336z"
        />
        <path style="fill:#73CC00;" d="M267.182,113.376c-9.027-5.628-16.017-14.071-19.858-23.984c-1.381-3.563-4.679-6.02-8.481-6.396
	l-95.447-9.428c-3.802-0.376-7.518,1.389-9.569,4.613c-5.706,8.969-14.213,15.882-24.167,19.635
	c-3.612,1.362-6.118,4.679-6.497,8.52l-1.009,10.216l123.673,11.835c3.802,0.376,7.101,2.833,8.481,6.396
	c3.841,9.912,10.831,18.356,19.858,23.984c3.276,2.042,5.084,5.786,4.705,9.627l-22.992,232.754
	c0.986-0.448,1.984-0.873,3.001-1.257c3.612-1.362,6.118-4.679,6.497-8.52l26.509-268.367
	C272.266,119.162,270.457,115.418,267.182,113.376z"/>
        <path style="fill:#B6FA4C;" d="M457.345,130.474L249.176,435.942c-5.229,7.673-15.689,9.655-23.362,4.426L72.924,336.177
	c-7.673-5.229-9.655-15.689-4.426-23.362L276.668,7.347c5.229-7.673,15.689-9.655,23.362-4.426l152.89,104.191
	C460.593,112.341,462.574,122.8,457.345,130.474z"/>
        <path style="fill:#A8E83A;" d="M452.92,107.112L300.03,2.921c-7.673-5.229-18.133-3.248-23.362,4.426l-17.806,26.129
	c1.545,0.483,3.047,1.195,4.455,2.154l152.89,104.191c7.673,5.229,9.655,15.689,4.426,23.362L230.27,442.523
	c6.88,2.152,14.637-0.314,18.907-6.58l208.169-305.469C462.574,122.8,460.593,112.341,452.92,107.112z"/>
        <path style="fill:#77DD00;" d="M268.802,62.482L116.937,285.329c-2.174,3.19-2.38,7.342-0.484,10.704
	c5.227,9.265,7.316,20.025,5.937,30.567c-0.495,3.788,1.222,7.526,4.379,9.677l79.258,54.012c3.157,2.152,7.264,2.383,10.609,0.536
	c9.307-5.138,20.085-7.129,30.62-5.654c3.823,0.535,7.612-1.175,9.786-4.365L408.907,157.96c2.174-3.19,2.38-7.342,0.483-10.704
	c-5.227-9.265-7.316-20.025-5.937-30.566c0.495-3.788-1.222-7.526-4.379-9.677L319.816,53c-3.157-2.152-7.264-2.383-10.609-0.536
	c-9.307,5.138-20.085,7.129-30.62,5.654C274.765,57.581,270.975,59.292,268.802,62.482z"/>
        <path style="fill:#73CC00;" d="M409.39,147.256c-5.227-9.265-7.315-20.025-5.937-30.566c0.495-3.788-1.222-7.526-4.379-9.678
	L319.816,53c-3.157-2.151-7.264-2.383-10.609-0.536c-9.306,5.138-20.085,7.129-30.62,5.653c-3.823-0.535-7.612,1.175-9.786,4.365
	l-6.329,9.287l99.054,66.77c3.157,2.152,4.875,5.889,4.379,9.677c-1.378,10.541,0.711,21.301,5.937,30.566
	c1.896,3.362,1.69,7.515-0.484,10.704L238.29,384.755c2.983-0.131,5.984-0.001,8.967,0.417c3.823,0.536,7.612-1.175,9.786-4.365
	L408.907,157.96C411.081,154.77,411.287,150.618,409.39,147.256z"/>
        <circle style="fill:#B6FA4C;" cx="286.18" cy="201" r="54.39"/>
        <path style="fill:#FFB125;" d="M453.122,512H34.109c-14.286,0-25.868-11.581-25.868-25.868V230.139
	c0-14.286,11.581-25.868,25.868-25.868h419.013c14.286,0,25.868,11.581,25.868,25.868v255.993
	C478.99,500.419,467.409,512,453.122,512z"/>
        <path style="fill:#FF901D;" d="M453.122,204.271h-47.06c14.286,0,25.868,11.582,25.868,25.868v255.993
	c0,14.286-11.582,25.868-25.868,25.868h47.06c14.286,0,25.868-11.581,25.868-25.868V230.139
	C478.99,215.853,467.408,204.271,453.122,204.271z"/>
        <path style="fill:#FF6D3A;" d="M494.387,308.688h-94.308c-27.309,0-49.447,22.138-49.447,49.447l0,0
	c0,27.309,22.138,49.447,49.447,49.447h94.308c5.176,0,9.372-4.196,9.372-9.372v-80.15
	C503.759,312.885,499.563,308.688,494.387,308.688z"/>
        <path style="fill:#ED5729;" d="M494.387,308.688H447.16c5.176,0,9.372,4.196,9.372,9.372v67.511c0,5.52-4.475,9.995-9.995,9.995
	h-46.459c-25.274,0-46.105-18.966-49.071-43.44c-0.239,1.971-0.376,3.973-0.376,6.008c0,27.309,22.138,49.447,49.447,49.447h47.081
	h47.227c5.176,0,9.372-4.196,9.372-9.372v-12.015V318.06C503.759,312.885,499.563,308.688,494.387,308.688z"/>
        <path style="fill:#FF6D3A;" d="M453.122,204.271H34.109c-14.286,0-25.868,11.582-25.868,25.868v28.348H478.99v-28.348
	C478.99,215.853,467.409,204.271,453.122,204.271z"/>
        <path style="fill:#ED5729;" d="M474.572,215.676c-0.93-1.376-1.989-2.658-3.159-3.828c-0.014-0.014-0.028-0.026-0.042-0.04
	c-1.159-1.154-2.426-2.2-3.787-3.119c-0.344-0.232-0.694-0.457-1.05-0.673c-0.529-0.321-1.074-0.618-1.627-0.902
	c-0.358-0.184-0.721-0.359-1.089-0.527c-3.261-1.484-6.881-2.317-10.697-2.317h-47.057c14.285,0.001,25.865,11.582,25.865,25.868
	v28.347h47.06v-28.347c0-4.465-1.131-8.665-3.122-12.33C475.47,217.076,475.037,216.364,474.572,215.676z"/>
        <path style="fill:#FF6D3A;" d="M34.109,512h419.013c14.286,0,25.868-11.582,25.868-25.868v-28.348H8.241v28.348
	C8.241,500.418,19.822,512,34.109,512z"/>
        <path style="fill:#ED5729;" d="M431.93,457.784v28.348c0,0.015,0,0.03,0,0.044c-0.004,2.389-2.004,4.296-4.393,4.296H34.109
	c-14.286,0-25.868-11.582-25.868-25.868v21.527C8.241,500.419,19.822,512,34.109,512h371.954h47.06c0.511,0,1.017-0.019,1.52-0.048
	c0.157-0.009,0.313-0.024,0.469-0.036c0.351-0.027,0.7-0.059,1.047-0.1c0.172-0.02,0.344-0.042,0.516-0.065
	c0.345-0.047,0.687-0.103,1.027-0.163c0.151-0.027,0.303-0.051,0.453-0.081c0.481-0.095,0.959-0.199,1.43-0.321c0,0,0.001,0,0.002,0
	c0.207-0.053,0.409-0.116,0.614-0.174c1.023-0.291,2.023-0.635,2.991-1.044c0.387-0.164,0.769-0.336,1.146-0.518
	c0.377-0.182,0.749-0.372,1.115-0.571l0.001-0.001c0.732-0.398,1.443-0.83,2.131-1.294l0.001-0.001l0.001-0.001
	c0.586-0.396,1.15-0.819,1.699-1.26c0.026-0.021,0.053-0.041,0.078-0.062c0.557-0.45,1.093-0.924,1.611-1.418l0,0l0,0
	c0.609-0.582,1.19-1.192,1.74-1.83v-0.001c0.86-0.998,1.647-2.061,2.349-3.183c0.019-0.03,0.039-0.06,0.058-0.09
	c0.258-0.417,0.508-0.839,0.743-1.271c0-0.001,0.001-0.002,0.002-0.004v-0.001c0.625-1.151,1.163-2.357,1.61-3.606
	c0.051-0.142,0.097-0.287,0.146-0.43c0.108-0.319,0.211-0.641,0.307-0.965c0.048-0.165,0.095-0.33,0.141-0.496
	c0.089-0.326,0.171-0.655,0.247-0.987c0.035-0.151,0.073-0.302,0.105-0.454c0.101-0.477,0.193-0.958,0.267-1.444
	c0-0.003,0.001-0.005,0.001-0.008c0-0.001,0-0.003,0-0.004c0.087-0.568,0.148-1.145,0.197-1.725
	c0.012-0.147,0.023-0.294,0.034-0.441c0.04-0.585,0.067-1.174,0.067-1.77l0,0v-21.527v-6.82L431.93,457.784L431.93,457.784z"/>
        <circle style="fill:#F2F2F2;" cx="401.84" cy="358.14" r="22.959"/>
</svg>

      Crypty

    </a>

    <!-- User -->
<!--    <ul class="md:hidden items-center flex flex-wrap list-none">-->
<!--      &lt;!&ndash;      <li class="inline-block relative">&ndash;&gt;-->
<!--      &lt;!&ndash;        <NotificationDropdown />&ndash;&gt;-->
<!--      &lt;!&ndash;      </li>&ndash;&gt;-->
<!--      <li class="inline-block relative">-->
<!--        <UserDropdown />-->
<!--      </li>-->
<!--    </ul>-->
    <!-- Collapse -->

    <div
      class="md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40  h-auto items-center flex-1 rounded {collapseShow}"
    >
      <!-- Collapse header -->
      <div
        class="md:min-w-full md:hidden block pb-4 mb-4 border-и border-solid border-transparent"
      >
        <div class="flex flex-wrap">
          <div class="w-6/12">
            <a
              use:link
              class="md:block text-left md:pb-2 text-blueGray-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0"
              href="/admin/dashboard"
            >
              Crypty
            </a>
          </div>
          <div class="w-6/12 flex justify-end">
            <button
              type="button"
              class="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
              on:click={() => toggleCollapseShow("hidden")}
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>



      <!-- Heading -->
      <div class="items-center">
        <a
          use:link
          href="/admin/dashboard"
          class="text-xs uppercase py-3 font-bold block {location.href.indexOf(
            '/admin/dashboard'
          ) !== -1
            ? 'text-red-500 hover:text-red-600'
            : 'text-blueGray-700 hover:text-blueGray-500'}"
        >
          <i
            class="fas fa-tv mr-2 text-sm {location.href.indexOf(
              '/admin/dashboard'
            ) !== -1
              ? 'opacity-75'
              : 'text-blueGray-300'}"></i>
          Dashboard
        </a>
      </div>


      <!-- Navigation -->

      <ul class="md:flex-col md:min-w-full flex flex-col list-none">
        {#if $purses.filter((p) => p.currency === "crypto").length > 0}
          <hr class="my-4 md:min-w-full" />
          <h6
                  class="md:min-w-full text-blueGray-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline"
          >
            Cryptocurrencies
          </h6>
        {/if}
        {#each $purses.filter((p) => p.currency === "crypto") as purse}
          <li class="items-center">
            <a
              use:link
              href="/admin/purse/{encodeURIComponent(purse.title)}"
              class="text-xs uppercase py-3 font-bold block {location.href.indexOf(
                '/admin/purse/' + encodeURIComponent(purse.title)
              ) !== -1
                ? 'text-red-500 hover:text-red-600'
                : 'text-blueGray-700 hover:text-blueGray-500'}"
            >
              <i
                class="fas fa-wallet mr-2 text-sm {location.href.indexOf(
                  '/admin/purse/' + encodeURIComponent(purse.title)
                ) !== -1
                  ? 'opacity-75'
                  : 'text-blueGray-300'}"></i>
              {purse.title}

            </a>
          </li>
        {/each}
      </ul>


      <!-- Navigation -->

      <ul class="md:flex-col md:min-w-full flex flex-col list-none md:mb-4">
        {#if $purses.filter((p) => p.currency === "regular").length > 0}
          <hr class="my-4 md:min-w-full" />
          <!-- Heading -->
          <h6
                  class="md:min-w-full text-blueGray-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline"
          >
            Regular currencies
          </h6>
        {/if}
        {#each $purses.filter((p) => p.currency === "regular") as purse}

        <li class="items-center">
          <a
            use:link
            href="/admin/purse/{encodeURIComponent(purse.title)}"
            class="text-xs uppercase py-3 font-bold block {location.href.indexOf(
              '/admin/purse/' + encodeURIComponent(purse.title)
            ) !== -1
              ? 'text-red-500 hover:text-red-600'
              : 'text-blueGray-700 hover:text-blueGray-500'}"
          >
            <i
              class="fas fa-wallet mr-2 text-sm {location.href.indexOf(
                '/admin/purse/' + encodeURIComponent(purse.title)
              ) !== -1
                ? 'opacity-75'
                : 'text-blueGray-300'}"></i>
            {purse.title}
          </a>
        </li>
      {/each}
      </ul>
        <hr class="my-4 md:min-w-full" />
        <div class="items-center mb-5">
          <a
            use:link
            href="/admin/plus"
            class="text-lg uppercase py-3 font-bold   {location.href.indexOf(
              '/admin/plus'
            ) !== -1
              ? 'text-red-500 hover:text-red-600'
              : 'text-blueGray-500 hover:text-blueGray-700'} "
          >
            <i
              class=" fas fa-plus mr-2 text-md transition duration-500 ease-in-out transform"
              onmouseover="this.style.transform = 'rotate(90deg)'"
              onmouseout="this.style.transform = 'rotate(180deg)'"></i>
          </a>
        </div>
        <div class="text-center bottom-0">
            <p class="text-center uppercase text-xs">background music</p>
            <audio id="audio">
                <source src="../../../music_tzichi_back_into_the_future.mp3" type="audio/mpeg">
            </audio>
            <button  id="playPauseBTN" onclick="playPause()"
                     class="inline-block px-6 py-2 text-xs font-medium leading-6 text-center text-black uppercase transition bg-gray-100 rounded-full shadow ripple hover:shadow-lg hover:bg-gray-200 focus:outline-none"
            >
                PLAY
            </button>
            <button onclick="stop()"
                    class="inline-block px-6 py-2 text-xs font-medium leading-6 text-center text-black uppercase transition bg-gray-100 rounded-full shadow ripple hover:shadow-lg hover:bg-gray-200 focus:outline-none"
            >
                STOP
            </button>
        </div>
    </div>



  </div>

    <script>
        const audio = document.getElementById('audio');
        let playPauseBTN = document.getElementById('playPauseBTN');
        let count = 0;

        function playPause(){
            if(count === 0){
                count = 1;
                audio.play();
                playPauseBTN.innerHTML = "Pause";
            }else{
                count = 0;
                audio.pause();
                playPauseBTN.innerHTML = "Play";
            }

        }
        function stop(){
            playPause()
            audio.pause();
            audio.currentTime = 0;
            playPauseBTN.innerHTML = "Play";
        }

    </script>
</nav>



<style>
 svg {
    vertical-align: baseline;
}

</style>
