<!-- App.svelte -->
<script>
  import {Router, Route, navigate} from "svelte-routing";
  // Admin Layout
  import Admin from "./layouts/Admin.svelte";

  export let url = "";

  window.addEventListener('load', function() {
    function updateOnlineStatus(event) {
      if(!navigator.onLine) {
        navi("/offline.html");
        setTimeout("",1);

        location.reload()
      } else {
        navi("/admin/dashboard")
      }

    }

    window.addEventListener('online',  updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    navigate("/admin/dashboard", {replace: true});
  });

  function navi(url) {
    navigate(url, { replace: true });
  }

</script>

<Router url="{url}">
  <!-- admin layout -->
  <Route path="admin/*admin" component="{Admin}" />
  <!-- auth layout -->
</Router>
