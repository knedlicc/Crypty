<script>
  import { link } from "svelte-routing";

  // core components
  import AuthNavbar from "components/Navbars/AuthNavbar.svelte";
  import Footer from "components/Footers/Footer.svelte";

  export let location;
</script>

<div>
  <AuthNavbar />
  <main>
    <div
      class="relative pt-16 pb-32 flex content-center items-center justify-center min-h-screen-75"
    >
      <div
        class="absolute top-0 w-full h-full bg-center bg-cover"
        style="
          background-image: url('assets/img/jr-korpa-jy6BJNpEPHI-unsplash-2.jpg');
        "
      >
        <span
          id="blackOverlay"
          class="w-full h-full absolute opacity-75 bg-black"
        ></span>
      </div>
      <div class="container relative mx-auto">
        <div class="items-center flex flex-wrap">
          <div class="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
            <div class="pr-6">
              <h1 class="text-white font-semibold text-5xl">
                Crypty
              </h1>
              <p class="mt-4 text-lg text-blueGray-200">
                Organize all your wallets.

              </p>
              <p class="mt-4 text-lg text-blueGray-200">

                Track the current price and be ready.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        class="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px"
        style="transform: translateZ(0);"
      >
        <svg
          class="absolute bottom-0 overflow-hidden"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          version="1.1"
          viewBox="0 0 2560 100"
          x="0"
          y="0"
        >
          <polygon
            class="text-blueGray-200 fill-current"
            points="2560 0 2560 100 0 100"
          ></polygon>
        </svg>
      </div>
    </div>

    <section class="pb-20 bg-blueGray-200 -mt-24">
      <div class="container mx-auto px-4">
        <div class="flex flex-wrap">
          <div class="lg:pt-12 pt-6 w-full md:w-4/12 px-4 text-center">
            <div
              class="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg"
            >
              <div class="px-4 py-5 flex-auto">
                <div
                  class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-red-400"
                >
                  <i class="fas fa-brain"></i>
                </div>
                <h6 class="text-xl font-semibold">All in one</h6>
                <p class="mt-2 mb-4 text-blueGray-500">
                  You can manage all your bank accounts or other wallets.
                </p>
              </div>
            </div>
          </div>

          <div class="w-full md:w-4/12 px-4 text-center">
            <div
              class="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg"
            >
              <div class="px-4 py-5 flex-auto">
                <div
                  class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-lightBlue-400"
                >
                  <i class="fab fa-creative-commons-nc"></i>
                </div>
                <h6 class="text-xl font-semibold">Free</h6>
                <p class="mt-2 mb-4 text-blueGray-500">
                  Simple and free. No need to pay anything.
                </p>
              </div>
            </div>
          </div>

          <div class="pt-6 w-full md:w-4/12 px-4 text-center">
            <div
              class="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg"
            >
              <div class="px-4 py-5 flex-auto">
                <div
                  class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-emerald-400"
                >
                  <i class="fas fa-couch"></i>
                </div>
                <h6 class="text-xl font-semibold">Comfortable</h6>
                <p class="mt-2 mb-4 text-blueGray-500">
                  Everything you need is at one place. You can also note modern and beautiful interface.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center mt-32">
          <div class="w-full md:w-5/12 px-4 mr-auto ml-auto">
            <div
              class="text-blueGray-500 p-3 text-center inline-flex items-center justify-center w-16 h-16 mb-6 shadow-lg rounded-full bg-white"
            >
              <i class="fas fa-user-friends text-xl"></i>
            </div>
            <h3 class="text-3xl mb-2 font-semibold leading-normal">
              Working with us is a pleasure
            </h3>
            <p
              class="text-lg font-light leading-relaxed mt-4 mb-4 text-blueGray-600"
            >
              Our mission is to share and grow the world’s knowledge.
              A vast amount of the knowledge that would be valuable to many people is currently only
              available to a few — either locked in people’s heads, or only accessible to select groups. We want
              to connect the people who have knowledge to the people who need it, to bring together people with different
              perspectives so they can understand each other better, and to empower everyone to share their knowledge for
              the benefit of the rest of the world.
            </p>

            <a use:link href="/auth/register" class="bg-white text-blueGray-700 active:bg-blueGray-50 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none lg:mr-1 lg:mb-0 ml-3 mb-3 ease-linear transition-all duration-150">
              Sign up!
            </a>
          </div>

          <div class="w-full md:w-4/12 px-4 mr-auto ml-auto">
            <div
              class="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg bg-red-400"
            >
              <img
                alt="..."
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1051&q=80"
                class="w-full align-middle rounded-t-lg"
              />
              <blockquote class="relative p-8 mb-4">
                <svg
                  preserveAspectRatio="none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 583 95"
                  class="absolute left-0 w-full block h-95-px -top-94-px"
                >
                  <polygon
                    points="-30,95 583,95 583,65"
                    class="text-red-400 fill-current"
                  ></polygon>
                </svg>
                <h4 class="text-xl font-bold text-white">
                  Top Notch Services
                </h4>
                <p class="text-md font-light mt-2 text-white">
                  The Arctic Ocean freezes every winter and much of the sea-ice
                  then thaws every summer, and that process will continue
                  whatever happens.
                </p>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="pb-20 relative block bg-blueGray-800">
      <div
        class="bottom-auto top-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden -mt-20 h-20"
        style="transform: translateZ(0);"
      >
        <svg
          class="absolute bottom-0 overflow-hidden"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          version="1.1"
          viewBox="0 0 2560 100"
          x="0"
          y="0"
        >
          <polygon
            class="text-blueGray-800 fill-current"
            points="2560 0 2560 100 0 100"
          ></polygon>
        </svg>
      </div>

      <div class="container mx-auto px-4 lg:pt-24 lg:pb-64">
        <div class="flex flex-wrap text-center justify-center">
          <div class="w-full lg:w-6/12 px-4">
            <h2 class="text-4xl font-semibold text-white">
              Build something
            </h2>
            <p class="text-lg leading-relaxed mt-4 mb-4 text-blueGray-400">
              Put the potentially record low maximum sea ice extent tihs year
              down to low ice. According to the National Oceanic and Atmospheric
              Administration, Ted, Scambos.
            </p>
          </div>
        </div>
        <div class="flex flex-wrap mt-12 justify-center">
          <div class="w-full lg:w-3/12 px-4 text-center">
            <div
              class="text-blueGray-800 p-3 w-12 h-12 shadow-lg rounded-full bg-white inline-flex items-center justify-center"
            >
              <i class="fas fa-medal text-xl"></i>
            </div>
            <h6 class="text-xl mt-5 font-semibold text-white">
              Excelent Services
            </h6>
            <p class="mt-2 mb-4 text-blueGray-400">
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </p>
          </div>
          <div class="w-full lg:w-3/12 px-4 text-center">
            <div
              class="text-blueGray-800 p-3 w-12 h-12 shadow-lg rounded-full bg-white inline-flex items-center justify-center"
            >
              <i class="fas fa-poll text-xl"></i>
            </div>
            <h5 class="text-xl mt-5 font-semibold text-white">
              Grow your market
            </h5>
            <p class="mt-2 mb-4 text-blueGray-400">
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </p>
          </div>
          <div class="w-full lg:w-3/12 px-4 text-center">
            <div
              class="text-blueGray-800 p-3 w-12 h-12 shadow-lg rounded-full bg-white inline-flex items-center justify-center"
            >
              <i class="fas fa-lightbulb text-xl"></i>
            </div>
            <h5 class="text-xl mt-5 font-semibold text-white">
              Launch time
            </h5>
            <p class="mt-2 mb-4 text-blueGray-400">
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </p>
          </div>
        </div>
      </div>
    </section>
    <section class="relative block py-24 lg:pt-0 bg-blueGray-800">
      <div class="container mx-auto px-4">
        <div class="flex flex-wrap justify-center lg:-mt-64 -mt-48">
          <div class="w-full lg:w-6/12 px-4">
            <div
              class="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200"
            >
              <div class="flex-auto p-5 lg:p-10">
                <h4 class="text-2xl font-semibold">
                  Have a question?
                </h4>
                <p class="leading-relaxed mt-1 mb-4 text-blueGray-500">
                  Complete this form and we will get back to you in 24 hours.
                </p>
                <div class="relative w-full mb-3 mt-8">
                  <label
                    class="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    for="full-name"
                  >
                    Full Name
                  </label>
                  <input
                    id="full-name"
                    type="text"
                    class="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Full Name"
                  />
                </div>

                <div class="relative w-full mb-3">
                  <label
                    class="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    for="email"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    class="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Email"
                  />
                </div>

                <div class="relative w-full mb-3">
                  <label
                    class="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    for="message"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows="4"
                    cols="80"
                    class="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    placeholder="Type a message..."
                  />
                </div>
                <div class="text-center mt-6">
                  <button
                    class="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
  <Footer />
</div>
