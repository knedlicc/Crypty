
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    function hostMatches(anchor) {
      const host = location.host;
      return (
        anchor.host == host ||
        // svelte seems to kill anchor.host value in ie11, so fall back to checking href
        anchor.href.indexOf(`https://${host}`) === 0 ||
        anchor.href.indexOf(`http://${host}`) === 0
      )
    }

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.35.0 */

    function create_fragment$b(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	return {
    		c() {
    			if (default_slot) default_slot.c();
    		},
    		m(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let $routes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	component_subscribe($$self, routes, value => $$invalidate(7, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	component_subscribe($$self, location, value => $$invalidate(6, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	component_subscribe($$self, base, value => $$invalidate(5, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	$$self.$$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 32) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			{
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 192) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		$base,
    		$location,
    		$routes,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$a, create_fragment$b, safe_not_equal, { basepath: 3, url: 4 });
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.35.0 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 4,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[2],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	return {
    		c() {
    			if (default_slot) default_slot.c();
    		},
    		m(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, routeParams, $location*/ 532) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    // (41:2) {#if component !== null}
    function create_if_block_1$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[2],
    		/*routeProps*/ ctx[3]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return { props: switch_instance_props };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	return {
    		c() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 28)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    function create_fragment$a(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7] && create_if_block$1(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
    	const location = getContext(LOCATION);
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 2) {
    			if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(2, routeParams = $activeRoute.params);
    			}
    		}

    		{
    			const { path, component, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$9, create_fragment$a, safe_not_equal, { path: 8, component: 0 });
    	}
    }

    /**
     * A link action that can be added to <a href=""> tags rather
     * than using the <Link> component.
     *
     * Example:
     * ```html
     * <a href="/post/{postId}" use:link>{post.title}</a>
     * ```
     */
    function link(node) {
      function onClick(event) {
        const anchor = event.currentTarget;

        if (
          anchor.target === "" &&
          hostMatches(anchor) &&
          shouldNavigate(event)
        ) {
          event.preventDefault();
          navigate(anchor.pathname + anchor.search, { replace: anchor.hasAttribute("replace") });
        }
      }

      node.addEventListener("click", onClick);

      return {
        destroy() {
          node.removeEventListener("click", onClick);
        }
      };
    }

    /* src/components/Navbars/AdminNavbar.svelte generated by Svelte v3.35.0 */

    function create_fragment$9(ctx) {
    	let nav;

    	return {
    		c() {
    			nav = element("nav");
    			nav.innerHTML = `<div class="w-full mx-auto items-center flex justify-between md:flex-nowrap flex-wrap md:px-10 px-4"><div class="text-blueGray-500 text-lg uppercase hidden lg:inline-block font-semibold mt-3">Overview</div></div>`;
    			attr(nav, "class", "absolute top-0 left-0 w-full z-10 bg-transparent md:flex-row md:flex-nowrap md:justify-start flex items-center p-4");
    		},
    		m(target, anchor) {
    			insert(target, nav, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(nav);
    		}
    	};
    }

    class AdminNavbar extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, create_fragment$9, safe_not_equal, {});
    	}
    }

    const persistStore = (key, initial) => {
        const persist = localStorage.getItem(key);
        const data = persist ? JSON.parse(persist) : initial;
        //if sub is broken, sets value to current local storage value
        const store = writable(data, () => {
            const unsubscribe = store.subscribe(value => {
                localStorage.setItem(key, JSON.stringify(value));
            });
            return unsubscribe
        });
        return store
    };

    persistStore('temp', []);

    const purses = persistStore('purses', []);

    class Total {
      /** @type {number} */
      incomes = 0;
      /** @type {number} */
      outcomes = 0;
      /** @type {number} */
      balance = 0;
    }

    class Purse {

      /** @type {String} */
      title;

      /** @type {String} */
      currency;

      total = new Total();

      /** @type {Expense[]} */
      expenses = [];

      static deletePurseFromPurses(title,cbFn = (p) =>{}){
        purses.update(purses => {
          const updated = purses.filter(function(value,index,arr) {
            return value.title !== title;
          });
          return updated;
        });
      }

      static updatePurseByTitle(title, cbFn = (p) => {}) {
        purses.update(purses => {
          const purse = purses.filter(p => p.title === title)[0];
          if (purse) {
            cbFn(purse);
          }

          return purses;
        });
      }
    }
    //
    // export function updatePurseByTitle(title, cbFn = (p) => {}) {
    //   purses.update(purses => {
    //     const purse = purses.filter(p => p.title === title)[0];
    //     if (purse) {
    //       cbFn(purse)
    //     }
    //
    //     return purses;
    //   })
    // }
    // export function deletePurseFromPurses(title,cbFn = (p) =>{}){
    //   purses.update(purses => {
    //     const updated = purses.filter(function(value,index,arr) {
    //         return value.title !== title;
    //     })
    //     return updated;
    //   })
    // }

    /* src/components/Sidebar/Sidebar.svelte generated by Svelte v3.35.0 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (200:8) {#if $purses.filter((p) => p.currency === "crypto").length > 0}
    function create_if_block_1(ctx) {
    	let hr;
    	let t0;
    	let h6;

    	return {
    		c() {
    			hr = element("hr");
    			t0 = space();
    			h6 = element("h6");
    			h6.textContent = "Cryptocurrencies";
    			attr(hr, "class", "my-4 md:min-w-full");
    			attr(h6, "class", "md:min-w-full text-blueGray-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline");
    		},
    		m(target, anchor) {
    			insert(target, hr, anchor);
    			insert(target, t0, anchor);
    			insert(target, h6, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(hr);
    			if (detaching) detach(t0);
    			if (detaching) detach(h6);
    		}
    	};
    }

    // (208:8) {#each $purses.filter((p) => p.currency === "crypto") as purse}
    function create_each_block_1(ctx) {
    	let li;
    	let a;
    	let i;
    	let i_class_value;
    	let t0;
    	let t1_value = /*purse*/ ctx[6].title + "";
    	let t1;
    	let a_href_value;
    	let a_class_value;
    	let t2;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			li = element("li");
    			a = element("a");
    			i = element("i");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();

    			attr(i, "class", i_class_value = "fas fa-wallet mr-2 text-sm " + (/*location*/ ctx[0].href.indexOf("/admin/purse/" + encodeURIComponent(/*purse*/ ctx[6].title)) !== -1
    			? "opacity-75"
    			: "text-blueGray-300"));

    			attr(a, "href", a_href_value = "/admin/purse/" + encodeURIComponent(/*purse*/ ctx[6].title));

    			attr(a, "class", a_class_value = "text-xs uppercase py-3 font-bold block " + (/*location*/ ctx[0].href.indexOf("/admin/purse/" + encodeURIComponent(/*purse*/ ctx[6].title)) !== -1
    			? "text-red-500 hover:text-red-600"
    			: "text-blueGray-700 hover:text-blueGray-500"));

    			attr(li, "class", "items-center");
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, a);
    			append(a, i);
    			append(a, t0);
    			append(a, t1);
    			append(li, t2);

    			if (!mounted) {
    				dispose = action_destroyer(link.call(null, a));
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*location, $purses*/ 5 && i_class_value !== (i_class_value = "fas fa-wallet mr-2 text-sm " + (/*location*/ ctx[0].href.indexOf("/admin/purse/" + encodeURIComponent(/*purse*/ ctx[6].title)) !== -1
    			? "opacity-75"
    			: "text-blueGray-300"))) {
    				attr(i, "class", i_class_value);
    			}

    			if (dirty & /*$purses*/ 4 && t1_value !== (t1_value = /*purse*/ ctx[6].title + "")) set_data(t1, t1_value);

    			if (dirty & /*$purses*/ 4 && a_href_value !== (a_href_value = "/admin/purse/" + encodeURIComponent(/*purse*/ ctx[6].title))) {
    				attr(a, "href", a_href_value);
    			}

    			if (dirty & /*location, $purses*/ 5 && a_class_value !== (a_class_value = "text-xs uppercase py-3 font-bold block " + (/*location*/ ctx[0].href.indexOf("/admin/purse/" + encodeURIComponent(/*purse*/ ctx[6].title)) !== -1
    			? "text-red-500 hover:text-red-600"
    			: "text-blueGray-700 hover:text-blueGray-500"))) {
    				attr(a, "class", a_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (236:8) {#if $purses.filter((p) => p.currency === "regular").length > 0}
    function create_if_block(ctx) {
    	let hr;
    	let t0;
    	let h6;

    	return {
    		c() {
    			hr = element("hr");
    			t0 = space();
    			h6 = element("h6");
    			h6.textContent = "Regular currencies";
    			attr(hr, "class", "my-4 md:min-w-full");
    			attr(h6, "class", "md:min-w-full text-blueGray-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline");
    		},
    		m(target, anchor) {
    			insert(target, hr, anchor);
    			insert(target, t0, anchor);
    			insert(target, h6, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(hr);
    			if (detaching) detach(t0);
    			if (detaching) detach(h6);
    		}
    	};
    }

    // (245:8) {#each $purses.filter((p) => p.currency === "regular") as purse}
    function create_each_block$1(ctx) {
    	let li;
    	let a;
    	let i;
    	let i_class_value;
    	let t0;
    	let t1_value = /*purse*/ ctx[6].title + "";
    	let t1;
    	let a_href_value;
    	let a_class_value;
    	let t2;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			li = element("li");
    			a = element("a");
    			i = element("i");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();

    			attr(i, "class", i_class_value = "fas fa-wallet mr-2 text-sm " + (/*location*/ ctx[0].href.indexOf("/admin/purse/" + encodeURIComponent(/*purse*/ ctx[6].title)) !== -1
    			? "opacity-75"
    			: "text-blueGray-300"));

    			attr(a, "href", a_href_value = "/admin/purse/" + encodeURIComponent(/*purse*/ ctx[6].title));

    			attr(a, "class", a_class_value = "text-xs uppercase py-3 font-bold block " + (/*location*/ ctx[0].href.indexOf("/admin/purse/" + encodeURIComponent(/*purse*/ ctx[6].title)) !== -1
    			? "text-red-500 hover:text-red-600"
    			: "text-blueGray-700 hover:text-blueGray-500"));

    			attr(li, "class", "items-center");
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, a);
    			append(a, i);
    			append(a, t0);
    			append(a, t1);
    			append(li, t2);

    			if (!mounted) {
    				dispose = action_destroyer(link.call(null, a));
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*location, $purses*/ 5 && i_class_value !== (i_class_value = "fas fa-wallet mr-2 text-sm " + (/*location*/ ctx[0].href.indexOf("/admin/purse/" + encodeURIComponent(/*purse*/ ctx[6].title)) !== -1
    			? "opacity-75"
    			: "text-blueGray-300"))) {
    				attr(i, "class", i_class_value);
    			}

    			if (dirty & /*$purses*/ 4 && t1_value !== (t1_value = /*purse*/ ctx[6].title + "")) set_data(t1, t1_value);

    			if (dirty & /*$purses*/ 4 && a_href_value !== (a_href_value = "/admin/purse/" + encodeURIComponent(/*purse*/ ctx[6].title))) {
    				attr(a, "href", a_href_value);
    			}

    			if (dirty & /*location, $purses*/ 5 && a_class_value !== (a_class_value = "text-xs uppercase py-3 font-bold block " + (/*location*/ ctx[0].href.indexOf("/admin/purse/" + encodeURIComponent(/*purse*/ ctx[6].title)) !== -1
    			? "text-red-500 hover:text-red-600"
    			: "text-blueGray-700 hover:text-blueGray-500"))) {
    				attr(a, "class", a_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$8(ctx) {
    	let nav;
    	let div8;
    	let button0;
    	let t0;
    	let a0;
    	let t2;
    	let div7;
    	let div3;
    	let div2;
    	let div0;
    	let a1;
    	let t4;
    	let div1;
    	let button1;
    	let t5;
    	let div4;
    	let a2;
    	let i2;
    	let i2_class_value;
    	let t6;
    	let a2_class_value;
    	let t7;
    	let ul0;
    	let show_if_1 = /*$purses*/ ctx[2].filter(func_1).length > 0;
    	let t8;
    	let t9;
    	let ul1;
    	let show_if = /*$purses*/ ctx[2].filter(func).length > 0;
    	let t10;
    	let t11;
    	let hr;
    	let t12;
    	let div5;
    	let a3;
    	let i3;
    	let a3_class_value;
    	let t13;
    	let div6;
    	let div7_class_value;
    	let t20;
    	let script;
    	let mounted;
    	let dispose;
    	let if_block0 = show_if_1 && create_if_block_1();
    	let each_value_1 = /*$purses*/ ctx[2].filter(func_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let if_block1 = show_if && create_if_block();
    	let each_value = /*$purses*/ ctx[2].filter(func_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	return {
    		c() {
    			nav = element("nav");
    			div8 = element("div");
    			button0 = element("button");
    			button0.innerHTML = `<i class="fas fa-bars"></i>`;
    			t0 = space();
    			a0 = element("a");

    			a0.innerHTML = `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 512 512" xml:space="preserve" width="15" height="15" class="inline svelte-zwjydt"><path style="fill:#FFB125;" d="M446.908,175.275H45.647c-9.906,0-17.936,8.03-17.936,17.936v48.18h437.134v-48.18
	C464.844,183.306,456.814,175.275,446.908,175.275z"></path><path style="fill:#B6FA4C;" d="M301.231,75.667l-36.338,367.865c-0.913,9.241-9.144,15.992-18.385,15.079l-184.12-18.188
	c-9.241-0.913-15.992-9.144-15.079-18.385L83.647,54.174c0.913-9.241,9.144-15.992,18.385-15.079l184.12,18.188
	C295.392,58.195,302.143,66.426,301.231,75.667z"></path><path style="fill:#A8E83A;" d="M286.152,57.282l-184.12-18.188c-9.241-0.913-17.472,5.838-18.385,15.079l-3.26,33.004
	c2.762-1.403,5.937-2.074,9.248-1.747l184.12,18.188c9.241,0.913,15.992,9.144,15.079,18.385l-33.078,334.862
	c4.945-2.512,8.551-7.403,9.136-13.332L301.23,75.668C302.144,66.426,295.392,58.195,286.152,57.282z"></path><path style="fill:#77DD00;" d="M103.162,106.336L76.653,374.703c-0.379,3.841,1.429,7.585,4.705,9.627
	c9.027,5.628,16.017,14.071,19.858,23.984c1.381,3.563,4.679,6.02,8.481,6.396l95.447,9.428c3.802,0.376,7.518-1.389,9.568-4.613
	c5.706-8.969,14.213-15.882,24.167-19.635c3.612-1.362,6.118-4.679,6.497-8.52l26.509-268.367c0.379-3.841-1.429-7.585-4.705-9.627
	c-9.027-5.628-16.017-14.071-19.858-23.984c-1.381-3.562-4.679-6.02-8.481-6.396l-95.447-9.428
	c-3.802-0.376-7.518,1.389-9.568,4.613c-5.706,8.969-14.213,15.882-24.167,19.635C106.048,99.178,103.542,102.495,103.162,106.336z"></path><path style="fill:#73CC00;" d="M267.182,113.376c-9.027-5.628-16.017-14.071-19.858-23.984c-1.381-3.563-4.679-6.02-8.481-6.396
	l-95.447-9.428c-3.802-0.376-7.518,1.389-9.569,4.613c-5.706,8.969-14.213,15.882-24.167,19.635
	c-3.612,1.362-6.118,4.679-6.497,8.52l-1.009,10.216l123.673,11.835c3.802,0.376,7.101,2.833,8.481,6.396
	c3.841,9.912,10.831,18.356,19.858,23.984c3.276,2.042,5.084,5.786,4.705,9.627l-22.992,232.754
	c0.986-0.448,1.984-0.873,3.001-1.257c3.612-1.362,6.118-4.679,6.497-8.52l26.509-268.367
	C272.266,119.162,270.457,115.418,267.182,113.376z"></path><path style="fill:#B6FA4C;" d="M457.345,130.474L249.176,435.942c-5.229,7.673-15.689,9.655-23.362,4.426L72.924,336.177
	c-7.673-5.229-9.655-15.689-4.426-23.362L276.668,7.347c5.229-7.673,15.689-9.655,23.362-4.426l152.89,104.191
	C460.593,112.341,462.574,122.8,457.345,130.474z"></path><path style="fill:#A8E83A;" d="M452.92,107.112L300.03,2.921c-7.673-5.229-18.133-3.248-23.362,4.426l-17.806,26.129
	c1.545,0.483,3.047,1.195,4.455,2.154l152.89,104.191c7.673,5.229,9.655,15.689,4.426,23.362L230.27,442.523
	c6.88,2.152,14.637-0.314,18.907-6.58l208.169-305.469C462.574,122.8,460.593,112.341,452.92,107.112z"></path><path style="fill:#77DD00;" d="M268.802,62.482L116.937,285.329c-2.174,3.19-2.38,7.342-0.484,10.704
	c5.227,9.265,7.316,20.025,5.937,30.567c-0.495,3.788,1.222,7.526,4.379,9.677l79.258,54.012c3.157,2.152,7.264,2.383,10.609,0.536
	c9.307-5.138,20.085-7.129,30.62-5.654c3.823,0.535,7.612-1.175,9.786-4.365L408.907,157.96c2.174-3.19,2.38-7.342,0.483-10.704
	c-5.227-9.265-7.316-20.025-5.937-30.566c0.495-3.788-1.222-7.526-4.379-9.677L319.816,53c-3.157-2.152-7.264-2.383-10.609-0.536
	c-9.307,5.138-20.085,7.129-30.62,5.654C274.765,57.581,270.975,59.292,268.802,62.482z"></path><path style="fill:#73CC00;" d="M409.39,147.256c-5.227-9.265-7.315-20.025-5.937-30.566c0.495-3.788-1.222-7.526-4.379-9.678
	L319.816,53c-3.157-2.151-7.264-2.383-10.609-0.536c-9.306,5.138-20.085,7.129-30.62,5.653c-3.823-0.535-7.612,1.175-9.786,4.365
	l-6.329,9.287l99.054,66.77c3.157,2.152,4.875,5.889,4.379,9.677c-1.378,10.541,0.711,21.301,5.937,30.566
	c1.896,3.362,1.69,7.515-0.484,10.704L238.29,384.755c2.983-0.131,5.984-0.001,8.967,0.417c3.823,0.536,7.612-1.175,9.786-4.365
	L408.907,157.96C411.081,154.77,411.287,150.618,409.39,147.256z"></path><circle style="fill:#B6FA4C;" cx="286.18" cy="201" r="54.39"></circle><path style="fill:#FFB125;" d="M453.122,512H34.109c-14.286,0-25.868-11.581-25.868-25.868V230.139
	c0-14.286,11.581-25.868,25.868-25.868h419.013c14.286,0,25.868,11.581,25.868,25.868v255.993
	C478.99,500.419,467.409,512,453.122,512z"></path><path style="fill:#FF901D;" d="M453.122,204.271h-47.06c14.286,0,25.868,11.582,25.868,25.868v255.993
	c0,14.286-11.582,25.868-25.868,25.868h47.06c14.286,0,25.868-11.581,25.868-25.868V230.139
	C478.99,215.853,467.408,204.271,453.122,204.271z"></path><path style="fill:#FF6D3A;" d="M494.387,308.688h-94.308c-27.309,0-49.447,22.138-49.447,49.447l0,0
	c0,27.309,22.138,49.447,49.447,49.447h94.308c5.176,0,9.372-4.196,9.372-9.372v-80.15
	C503.759,312.885,499.563,308.688,494.387,308.688z"></path><path style="fill:#ED5729;" d="M494.387,308.688H447.16c5.176,0,9.372,4.196,9.372,9.372v67.511c0,5.52-4.475,9.995-9.995,9.995
	h-46.459c-25.274,0-46.105-18.966-49.071-43.44c-0.239,1.971-0.376,3.973-0.376,6.008c0,27.309,22.138,49.447,49.447,49.447h47.081
	h47.227c5.176,0,9.372-4.196,9.372-9.372v-12.015V318.06C503.759,312.885,499.563,308.688,494.387,308.688z"></path><path style="fill:#FF6D3A;" d="M453.122,204.271H34.109c-14.286,0-25.868,11.582-25.868,25.868v28.348H478.99v-28.348
	C478.99,215.853,467.409,204.271,453.122,204.271z"></path><path style="fill:#ED5729;" d="M474.572,215.676c-0.93-1.376-1.989-2.658-3.159-3.828c-0.014-0.014-0.028-0.026-0.042-0.04
	c-1.159-1.154-2.426-2.2-3.787-3.119c-0.344-0.232-0.694-0.457-1.05-0.673c-0.529-0.321-1.074-0.618-1.627-0.902
	c-0.358-0.184-0.721-0.359-1.089-0.527c-3.261-1.484-6.881-2.317-10.697-2.317h-47.057c14.285,0.001,25.865,11.582,25.865,25.868
	v28.347h47.06v-28.347c0-4.465-1.131-8.665-3.122-12.33C475.47,217.076,475.037,216.364,474.572,215.676z"></path><path style="fill:#FF6D3A;" d="M34.109,512h419.013c14.286,0,25.868-11.582,25.868-25.868v-28.348H8.241v28.348
	C8.241,500.418,19.822,512,34.109,512z"></path><path style="fill:#ED5729;" d="M431.93,457.784v28.348c0,0.015,0,0.03,0,0.044c-0.004,2.389-2.004,4.296-4.393,4.296H34.109
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
	c0.012-0.147,0.023-0.294,0.034-0.441c0.04-0.585,0.067-1.174,0.067-1.77l0,0v-21.527v-6.82L431.93,457.784L431.93,457.784z"></path><circle style="fill:#F2F2F2;" cx="401.84" cy="358.14" r="22.959"></circle></svg>

      Crypty`;

    			t2 = space();
    			div7 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			a1 = element("a");
    			a1.textContent = "Crypty";
    			t4 = space();
    			div1 = element("div");
    			button1 = element("button");
    			button1.innerHTML = `<i class="fas fa-times"></i>`;
    			t5 = space();
    			div4 = element("div");
    			a2 = element("a");
    			i2 = element("i");
    			t6 = text("\n          Dashboard");
    			t7 = space();
    			ul0 = element("ul");
    			if (if_block0) if_block0.c();
    			t8 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t9 = space();
    			ul1 = element("ul");
    			if (if_block1) if_block1.c();
    			t10 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t11 = space();
    			hr = element("hr");
    			t12 = space();
    			div5 = element("div");
    			a3 = element("a");
    			i3 = element("i");
    			t13 = space();
    			div6 = element("div");

    			div6.innerHTML = `<p class="text-center uppercase text-xs">background music</p> 
            <audio id="audio"><source src="../../../music_tzichi_back_into_the_future.mp3" type="audio/mpeg"/></audio> 
            <button id="playPauseBTN" onclick="playPause()" class="inline-block px-6 py-2 text-xs font-medium leading-6 text-center text-black uppercase transition bg-gray-100 rounded-full shadow ripple hover:shadow-lg hover:bg-gray-200 focus:outline-none">PLAY</button> 
            <button onclick="stop()" class="inline-block px-6 py-2 text-xs font-medium leading-6 text-center text-black uppercase transition bg-gray-100 rounded-full shadow ripple hover:shadow-lg hover:bg-gray-200 focus:outline-none">STOP</button>`;

    			t20 = space();
    			script = element("script");
    			script.textContent = "const audio = document.getElementById('audio');\n        let playPauseBTN = document.getElementById('playPauseBTN');\n        let count = 0;\n\n        function playPause(){\n            if(count === 0){\n                count = 1;\n                audio.play();\n                playPauseBTN.innerHTML = \"Pause\";\n            }else{\n                count = 0;\n                audio.pause();\n                playPauseBTN.innerHTML = \"Play\";\n            }\n\n        }\n        function stop(){\n            playPause()\n            audio.pause();\n            audio.currentTime = 0;\n            playPauseBTN.innerHTML = \"Play\";\n        }";
    			attr(button0, "class", "cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent");
    			attr(button0, "type", "button");
    			attr(a0, "class", "md:block text-left md:pb-2 text-blueGray-600 mr-0 inline-block whitespace-nowrap text-lg uppercase font-bold p-4 px-0");
    			attr(a0, "href", "/admin/dashboard");
    			attr(a1, "class", "md:block text-left md:pb-2 text-blueGray-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0");
    			attr(a1, "href", "/admin/dashboard");
    			attr(div0, "class", "w-6/12");
    			attr(button1, "type", "button");
    			attr(button1, "class", "cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent");
    			attr(div1, "class", "w-6/12 flex justify-end");
    			attr(div2, "class", "flex flex-wrap");
    			attr(div3, "class", "md:min-w-full md:hidden block pb-4 mb-4 border-и border-solid border-transparent");

    			attr(i2, "class", i2_class_value = "fas fa-tv mr-2 text-sm " + (/*location*/ ctx[0].href.indexOf("/admin/dashboard") !== -1
    			? "opacity-75"
    			: "text-blueGray-300"));

    			attr(a2, "href", "/admin/dashboard");

    			attr(a2, "class", a2_class_value = "text-xs uppercase py-3 font-bold block " + (/*location*/ ctx[0].href.indexOf("/admin/dashboard") !== -1
    			? "text-red-500 hover:text-red-600"
    			: "text-blueGray-700 hover:text-blueGray-500"));

    			attr(div4, "class", "items-center");
    			attr(ul0, "class", "md:flex-col md:min-w-full flex flex-col list-none");
    			attr(ul1, "class", "md:flex-col md:min-w-full flex flex-col list-none md:mb-4");
    			attr(hr, "class", "my-4 md:min-w-full");
    			attr(i3, "class", " fas fa-plus mr-2 text-md transition duration-500 ease-in-out transform");
    			attr(i3, "onmouseover", "this.style.transform = 'rotate(90deg)'");
    			attr(i3, "onmouseout", "this.style.transform = 'rotate(180deg)'");
    			attr(a3, "href", "/admin/plus");

    			attr(a3, "class", a3_class_value = "text-lg uppercase py-3 font-bold   " + (/*location*/ ctx[0].href.indexOf("/admin/plus") !== -1
    			? "text-red-500 hover:text-red-600"
    			: "text-blueGray-500 hover:text-blueGray-700") + " ");

    			attr(div5, "class", "items-center mb-5");
    			attr(div6, "class", "text-center bottom-0");
    			attr(div7, "class", div7_class_value = "md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40  h-auto items-center flex-1 rounded " + /*collapseShow*/ ctx[1]);
    			attr(div8, "class", "md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto");
    			attr(nav, "class", "md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-xl bg-white flex flex-wrap items-center justify-between relative md:w-64 z-10 py-4 px-6");
    		},
    		m(target, anchor) {
    			insert(target, nav, anchor);
    			append(nav, div8);
    			append(div8, button0);
    			append(div8, t0);
    			append(div8, a0);
    			append(div8, t2);
    			append(div8, div7);
    			append(div7, div3);
    			append(div3, div2);
    			append(div2, div0);
    			append(div0, a1);
    			append(div2, t4);
    			append(div2, div1);
    			append(div1, button1);
    			append(div7, t5);
    			append(div7, div4);
    			append(div4, a2);
    			append(a2, i2);
    			append(a2, t6);
    			append(div7, t7);
    			append(div7, ul0);
    			if (if_block0) if_block0.m(ul0, null);
    			append(ul0, t8);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul0, null);
    			}

    			append(div7, t9);
    			append(div7, ul1);
    			if (if_block1) if_block1.m(ul1, null);
    			append(ul1, t10);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul1, null);
    			}

    			append(div7, t11);
    			append(div7, hr);
    			append(div7, t12);
    			append(div7, div5);
    			append(div5, a3);
    			append(a3, i3);
    			append(div7, t13);
    			append(div7, div6);
    			append(nav, t20);
    			append(nav, script);

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*click_handler*/ ctx[4]),
    					action_destroyer(link.call(null, a0)),
    					action_destroyer(link.call(null, a1)),
    					listen(button1, "click", /*click_handler_1*/ ctx[5]),
    					action_destroyer(link.call(null, a2)),
    					action_destroyer(link.call(null, a3))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*location*/ 1 && i2_class_value !== (i2_class_value = "fas fa-tv mr-2 text-sm " + (/*location*/ ctx[0].href.indexOf("/admin/dashboard") !== -1
    			? "opacity-75"
    			: "text-blueGray-300"))) {
    				attr(i2, "class", i2_class_value);
    			}

    			if (dirty & /*location*/ 1 && a2_class_value !== (a2_class_value = "text-xs uppercase py-3 font-bold block " + (/*location*/ ctx[0].href.indexOf("/admin/dashboard") !== -1
    			? "text-red-500 hover:text-red-600"
    			: "text-blueGray-700 hover:text-blueGray-500"))) {
    				attr(a2, "class", a2_class_value);
    			}

    			if (dirty & /*$purses*/ 4) show_if_1 = /*$purses*/ ctx[2].filter(func_1).length > 0;

    			if (show_if_1) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1();
    					if_block0.c();
    					if_block0.m(ul0, t8);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*encodeURIComponent, $purses, location*/ 5) {
    				each_value_1 = /*$purses*/ ctx[2].filter(func_2);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*$purses*/ 4) show_if = /*$purses*/ ctx[2].filter(func).length > 0;

    			if (show_if) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block();
    					if_block1.c();
    					if_block1.m(ul1, t10);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*encodeURIComponent, $purses, location*/ 5) {
    				each_value = /*$purses*/ ctx[2].filter(func_3);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*location*/ 1 && a3_class_value !== (a3_class_value = "text-lg uppercase py-3 font-bold   " + (/*location*/ ctx[0].href.indexOf("/admin/plus") !== -1
    			? "text-red-500 hover:text-red-600"
    			: "text-blueGray-500 hover:text-blueGray-700") + " ")) {
    				attr(a3, "class", a3_class_value);
    			}

    			if (dirty & /*collapseShow*/ 2 && div7_class_value !== (div7_class_value = "md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40  h-auto items-center flex-1 rounded " + /*collapseShow*/ ctx[1])) {
    				attr(div7, "class", div7_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(nav);
    			if (if_block0) if_block0.d();
    			destroy_each(each_blocks_1, detaching);
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    const func = p => p.currency === "regular";
    const func_1 = p => p.currency === "crypto";
    const func_2 = p => p.currency === "crypto";
    const func_3 = p => p.currency === "regular";

    function instance$8($$self, $$props, $$invalidate) {
    	let $purses;
    	component_subscribe($$self, purses, $$value => $$invalidate(2, $purses = $$value));
    	let collapseShow = "hidden";

    	function toggleCollapseShow(classes) {
    		$$invalidate(1, collapseShow = classes);
    	}

    	for (let pi in $purses.filter(p => p.currency === "regular")) {
    		Purse.updatePurseByTitle(pi.title, pi => {
    			pi.expenses = [];
    		});
    	}

    	window.onload = () => {
    		const el = document.getElementById("Capa_1");

    		el.addEventListener("mouseover", () => {
    			el.style.transform = "scale(1.2";
    		});

    		el.addEventListener("mouseout", () => {
    			el.style.transform = "scale(1)";
    		});
    	};

    	let { location } = $$props;
    	const click_handler = () => toggleCollapseShow("bg-white m-2 py-3 px-6");
    	const click_handler_1 = () => toggleCollapseShow("hidden");

    	$$self.$$set = $$props => {
    		if ("location" in $$props) $$invalidate(0, location = $$props.location);
    	};

    	return [
    		location,
    		collapseShow,
    		$purses,
    		toggleCollapseShow,
    		click_handler,
    		click_handler_1
    	];
    }

    class Sidebar extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { location: 0 });
    	}
    }

    /* src/components/Cards/CardStats.svelte generated by Svelte v3.35.0 */

    function create_fragment$7(ctx) {
    	let div5;
    	let div4;
    	let div3;
    	let div0;
    	let h5;
    	let t0;
    	let t1;
    	let span0;
    	let t2;
    	let t3;
    	let div2;
    	let div1;
    	let i;
    	let div1_class_value;
    	let t4;
    	let p;
    	let span1;
    	let t5;
    	let t6;
    	let span1_class_value;
    	let t7;
    	let span2;
    	let t8;

    	return {
    		c() {
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			t0 = text(/*statSubtitle*/ ctx[0]);
    			t1 = space();
    			span0 = element("span");
    			t2 = text(/*statTitle*/ ctx[1]);
    			t3 = space();
    			div2 = element("div");
    			div1 = element("div");
    			i = element("i");
    			t4 = space();
    			p = element("p");
    			span1 = element("span");
    			t5 = text(/*statPercent*/ ctx[2]);
    			t6 = text("%");
    			t7 = space();
    			span2 = element("span");
    			t8 = text(/*statDescripiron*/ ctx[4]);
    			attr(h5, "class", "text-blueGray-400 uppercase font-bold text-xs");
    			attr(span0, "class", "font-semibold text-xl text-blueGray-700");
    			attr(div0, "class", "relative w-full pr-4 max-w-full flex-grow flex-1");
    			attr(i, "class", /*statIconName*/ ctx[5]);
    			attr(div1, "class", div1_class_value = "text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full " + /*statIconColor*/ ctx[6]);
    			attr(div2, "class", "relative w-auto pl-4 flex-initial");
    			attr(div3, "class", "flex flex-wrap");
    			attr(span1, "class", span1_class_value = "mr-2 " + /*statPercentColor*/ ctx[3]);
    			attr(span2, "class", "whitespace-nowrap");
    			attr(p, "class", "text-sm text-blueGray-400 mt-4");
    			attr(div4, "class", "flex-auto p-4");
    			attr(div5, "class", "relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg");
    		},
    		m(target, anchor) {
    			insert(target, div5, anchor);
    			append(div5, div4);
    			append(div4, div3);
    			append(div3, div0);
    			append(div0, h5);
    			append(h5, t0);
    			append(div0, t1);
    			append(div0, span0);
    			append(span0, t2);
    			append(div3, t3);
    			append(div3, div2);
    			append(div2, div1);
    			append(div1, i);
    			append(div4, t4);
    			append(div4, p);
    			append(p, span1);
    			append(span1, t5);
    			append(span1, t6);
    			append(p, t7);
    			append(p, span2);
    			append(span2, t8);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*statSubtitle*/ 1) set_data(t0, /*statSubtitle*/ ctx[0]);
    			if (dirty & /*statTitle*/ 2) set_data(t2, /*statTitle*/ ctx[1]);

    			if (dirty & /*statIconName*/ 32) {
    				attr(i, "class", /*statIconName*/ ctx[5]);
    			}

    			if (dirty & /*statIconColor*/ 64 && div1_class_value !== (div1_class_value = "text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full " + /*statIconColor*/ ctx[6])) {
    				attr(div1, "class", div1_class_value);
    			}

    			if (dirty & /*statPercent*/ 4) set_data(t5, /*statPercent*/ ctx[2]);

    			if (dirty & /*statPercentColor*/ 8 && span1_class_value !== (span1_class_value = "mr-2 " + /*statPercentColor*/ ctx[3])) {
    				attr(span1, "class", span1_class_value);
    			}

    			if (dirty & /*statDescripiron*/ 16) set_data(t8, /*statDescripiron*/ ctx[4]);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div5);
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { statSubtitle = "Traffic" } = $$props;
    	let { statTitle = "350,897" } = $$props;
    	let { statPercent = "3.48" } = $$props;
    	let { statPercentColor = "text-emerald-500" } = $$props;
    	let { statDescripiron = "Since last month" } = $$props;
    	let { statIconName = "far fa-chart-bar" } = $$props;
    	let { statIconColor = "bg-red-500" } = $$props;

    	$$self.$$set = $$props => {
    		if ("statSubtitle" in $$props) $$invalidate(0, statSubtitle = $$props.statSubtitle);
    		if ("statTitle" in $$props) $$invalidate(1, statTitle = $$props.statTitle);
    		if ("statPercent" in $$props) $$invalidate(2, statPercent = $$props.statPercent);
    		if ("statPercentColor" in $$props) $$invalidate(3, statPercentColor = $$props.statPercentColor);
    		if ("statDescripiron" in $$props) $$invalidate(4, statDescripiron = $$props.statDescripiron);
    		if ("statIconName" in $$props) $$invalidate(5, statIconName = $$props.statIconName);
    		if ("statIconColor" in $$props) $$invalidate(6, statIconColor = $$props.statIconColor);
    	};

    	return [
    		statSubtitle,
    		statTitle,
    		statPercent,
    		statPercentColor,
    		statDescripiron,
    		statIconName,
    		statIconColor
    	];
    }

    class CardStats extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			statSubtitle: 0,
    			statTitle: 1,
    			statPercent: 2,
    			statPercentColor: 3,
    			statDescripiron: 4,
    			statIconName: 5,
    			statIconColor: 6
    		});
    	}
    }

    function unfetch_module(e,n){return n=n||{},new Promise(function(t,r){var s=new XMLHttpRequest,o=[],u=[],i={},a=function(){return {ok:2==(s.status/100|0),statusText:s.statusText,status:s.status,url:s.responseURL,text:function(){return Promise.resolve(s.responseText)},json:function(){return Promise.resolve(s.responseText).then(JSON.parse)},blob:function(){return Promise.resolve(new Blob([s.response]))},clone:a,headers:{keys:function(){return o},entries:function(){return u},get:function(e){return i[e.toLowerCase()]},has:function(e){return e.toLowerCase()in i}}}};for(var l in s.open(n.method||"get",e,!0),s.onload=function(){s.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm,function(e,n,t){o.push(n=n.toLowerCase()),u.push([n,t]),i[n]=i[n]?i[n]+","+t:t;}),t(a());},s.onerror=r,s.withCredentials="include"==n.credentials,n.headers)s.setRequestHeader(l,n.headers[l]);s.send(n.body||null);})}

    var unfetch_module$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': unfetch_module
    });

    function getAugmentedNamespace(n) {
    	if (n.__esModule) return n;
    	var a = Object.defineProperty({}, '__esModule', {value: true});
    	Object.keys(n).forEach(function (k) {
    		var d = Object.getOwnPropertyDescriptor(n, k);
    		Object.defineProperty(a, k, d.get ? d : {
    			enumerable: true,
    			get: function () {
    				return n[k];
    			}
    		});
    	});
    	return a;
    }

    var require$$0 = /*@__PURE__*/getAugmentedNamespace(unfetch_module$1);

    var browser = self.fetch || (self.fetch = require$$0.default || require$$0);

    /* src/components/Headers/HeaderStats.svelte generated by Svelte v3.35.0 */

    function get_then_context(ctx) {
    	ctx[5] = ctx[9][0];
    	ctx[6] = ctx[9][1];
    	ctx[7] = ctx[9][2];
    	ctx[8] = ctx[9][3];
    }

    // (1:0) <script>   // core components   import CardStats from "components/Cards/CardStats.svelte";   import fetch from 'isomorphic-unfetch'   import {navigate}
    function create_catch_block(ctx) {
    	return {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    // (65:0) {:then [dataBtc,dataEth,dataUsdt,dataLite]}
    function create_then_block(ctx) {
    	get_then_context(ctx);
    	let div7;
    	let div6;
    	let div5;
    	let div4;
    	let div0;
    	let cardstats0;
    	let t0;
    	let div1;
    	let cardstats1;
    	let t1;
    	let div2;
    	let cardstats2;
    	let t2;
    	let div3;
    	let cardstats3;
    	let current;

    	cardstats0 = new CardStats({
    			props: {
    				statSubtitle: "BITCOIN",
    				statTitle: "$" + /*dataBtc*/ ctx[5].data.market_data.price_usd.toString().substr(0, 8),
    				statArrow: "" + ((/*dataBtc*/ ctx[5].data.market_data.percent_change_usd_last_24_hours.toString().startsWith("-") === true
    				? "down"
    				: "up") + " "),
    				statPercent: /*dataBtc*/ ctx[5].data.market_data.percent_change_usd_last_24_hours.toString().substr(0, 5),
    				statPercentColor: "" + ((/*dataBtc*/ ctx[5].data.market_data.percent_change_usd_last_24_hours.toString().startsWith("-") === true
    				? "text-red-500"
    				: "text-emerald-500") + " "),
    				statDescripiron: new Date(Date.parse(/*dataBtc*/ ctx[5].data.market_data.last_trade_at.toString())).toLocaleString(),
    				statIconName: "far fa-chart-bar",
    				statIconColor: "bg-red-500"
    			}
    		});

    	cardstats1 = new CardStats({
    			props: {
    				statSubtitle: "ETHEREUM",
    				statTitle: "$" + /*dataEth*/ ctx[6].data.market_data.price_usd.toString().substr(0, 8),
    				statArrow: "" + ((/*dataEth*/ ctx[6].data.market_data.percent_change_usd_last_24_hours.toString().startsWith("-") === true
    				? "down"
    				: "up") + " "),
    				statPercent: /*dataEth*/ ctx[6].data.market_data.percent_change_usd_last_24_hours.toString().substr(0, 5),
    				statPercentColor: "" + ((/*dataEth*/ ctx[6].data.market_data.percent_change_usd_last_24_hours.toString().startsWith("-") === true
    				? "text-red-500"
    				: "text-emerald-500") + " "),
    				statDescripiron: new Date(Date.parse(/*dataEth*/ ctx[6].data.market_data.last_trade_at.toString())).toLocaleString(),
    				statIconName: "fas fa-chart-bar",
    				statIconColor: "bg-orange-500"
    			}
    		});

    	cardstats2 = new CardStats({
    			props: {
    				statSubtitle: "USDT",
    				statTitle: "$" + /*dataUsdt*/ ctx[7].data.market_data.price_usd.toString().substr(0, 8),
    				statArrow: "" + ((/*dataUsdt*/ ctx[7].data.market_data.percent_change_usd_last_24_hours.toString().startsWith("-") === true
    				? "down"
    				: "up") + " "),
    				statPercent: /*dataUsdt*/ ctx[7].data.market_data.percent_change_usd_last_24_hours.toString().substr(0, 5),
    				statPercentColor: "" + ((/*dataUsdt*/ ctx[7].data.market_data.percent_change_usd_last_24_hours.toString().startsWith("-") === true
    				? "text-red-500"
    				: "text-emerald-500") + " "),
    				statDescripiron: new Date(Date.parse(/*dataUsdt*/ ctx[7].data.market_data.last_trade_at.toString())).toLocaleString(),
    				statIconName: "fas fa-chart-bar",
    				statIconColor: "bg-pink-500"
    			}
    		});

    	cardstats3 = new CardStats({
    			props: {
    				statSubtitle: "LITECOIN",
    				statTitle: "$" + /*dataLite*/ ctx[8].data.market_data.price_usd.toString().substr(0, 8),
    				statArrow: "" + ((/*dataLite*/ ctx[8].data.market_data.percent_change_usd_last_24_hours.toString().startsWith("-") === true
    				? "down"
    				: "up") + " "),
    				statPercent: /*dataLite*/ ctx[8].data.market_data.percent_change_usd_last_24_hours.toString().substr(0, 5),
    				statPercentColor: "" + ((/*dataLite*/ ctx[8].data.market_data.percent_change_usd_last_24_hours.toString().startsWith("-") === true
    				? "text-red-500"
    				: "text-emerald-500") + " "),
    				statDescripiron: new Date(Date.parse(/*dataLite*/ ctx[8].data.market_data.last_trade_at.toString())).toLocaleString(),
    				statIconName: "fas fa-chart-bar",
    				statIconColor: "bg-emerald-500"
    			}
    		});

    	return {
    		c() {
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			create_component(cardstats0.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(cardstats1.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			create_component(cardstats2.$$.fragment);
    			t2 = space();
    			div3 = element("div");
    			create_component(cardstats3.$$.fragment);
    			attr(div0, "class", "w-full lg:w-6/12 xl:w-3/12 px-4");
    			attr(div1, "class", "w-full lg:w-6/12 xl:w-3/12 px-4");
    			attr(div2, "class", "w-full lg:w-6/12 xl:w-3/12 px-4");
    			attr(div3, "class", "w-full lg:w-6/12 xl:w-3/12 px-4");
    			attr(div4, "class", "flex flex-wrap");
    			attr(div6, "class", "px-4 md:px-10 mx-auto w-full");
    			attr(div7, "class", "relative md:pt-32 md:pb-32 mb-4");
    		},
    		m(target, anchor) {
    			insert(target, div7, anchor);
    			append(div7, div6);
    			append(div6, div5);
    			append(div5, div4);
    			append(div4, div0);
    			mount_component(cardstats0, div0, null);
    			append(div4, t0);
    			append(div4, div1);
    			mount_component(cardstats1, div1, null);
    			append(div4, t1);
    			append(div4, div2);
    			mount_component(cardstats2, div2, null);
    			append(div4, t2);
    			append(div4, div3);
    			mount_component(cardstats3, div3, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			get_then_context(ctx);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(cardstats0.$$.fragment, local);
    			transition_in(cardstats1.$$.fragment, local);
    			transition_in(cardstats2.$$.fragment, local);
    			transition_in(cardstats3.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(cardstats0.$$.fragment, local);
    			transition_out(cardstats1.$$.fragment, local);
    			transition_out(cardstats2.$$.fragment, local);
    			transition_out(cardstats3.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div7);
    			destroy_component(cardstats0);
    			destroy_component(cardstats1);
    			destroy_component(cardstats2);
    			destroy_component(cardstats3);
    		}
    	};
    }

    // (64:13)  {:then [dataBtc,dataEth,dataUsdt,dataLite]}
    function create_pending_block(ctx) {
    	return {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    function create_fragment$6(ctx) {
    	let await_block_anchor;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 9,
    		blocks: [,,,]
    	};

    	handle_promise(/*test*/ ctx[0], info);

    	return {
    		c() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m(target, anchor) {
    			insert(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[9] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};
    }

    function instance$6($$self) {
    	const fetchDataBtc = (async () => {
    		const response = await browser("https://data.messari.io/api/v1/assets/btc/metrics", {
    			headers: {
    				"x-messari-api-key": "de4cda7f-e4df-4e77-a476-0120085fb840"
    			}
    		});

    		return response.json();
    	})();

    	const fetchDataEth = (async () => {
    		const response = await browser("https://data.messari.io/api/v1/assets/eth/metrics", {
    			headers: {
    				"x-messari-api-key": "de4cda7f-e4df-4e77-a476-0120085fb840"
    			}
    		});

    		return response.json();
    	})();

    	const fetchDataUsdt = (async () => {
    		const response = await browser("https://data.messari.io/api/v1/assets/usdt/metrics", {
    			headers: {
    				"x-messari-api-key": "de4cda7f-e4df-4e77-a476-0120085fb840"
    			}
    		});

    		return response.json();
    	})();

    	const fetchDataLite = (async () => {
    		const response = await browser("https://data.messari.io/api/v1/assets/litecoin/metrics", {
    			headers: {
    				"x-messari-api-key": "de4cda7f-e4df-4e77-a476-0120085fb840"
    			}
    		});

    		return response.json();
    	})();

    	const test = Promise.all([fetchDataBtc, fetchDataEth, fetchDataUsdt, fetchDataLite]);
    	return [test];
    }

    class HeaderStats extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});
    	}
    }

    /* src/components/Footers/FooterAdmin.svelte generated by Svelte v3.35.0 */

    function create_fragment$5(ctx) {
    	let footer;
    	let div4;
    	let hr;
    	let t0;
    	let div3;
    	let div1;
    	let div0;
    	let t4;
    	let div2;

    	return {
    		c() {
    			footer = element("footer");
    			div4 = element("div");
    			hr = element("hr");
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");

    			div0.textContent = `Copyright © ${/*date*/ ctx[0]}

            Andrey Bortnikov`;

    			t4 = space();
    			div2 = element("div");
    			div2.textContent = "ČVUT FEL, KAJ 2021";
    			attr(hr, "class", "mb-4 border-b-1 border-blueGray-200");
    			attr(div0, "class", "text-sm text-blueGray-500 font-semibold py-1 text-center md:text-left");
    			attr(div1, "class", "w-full md:w-6/12 px-20 ");
    			attr(div2, "class", "text-sm text-blueGray-500 font-semibold py-1 text-center text-right");
    			attr(div3, "class", "flex flex-wrap items-center md:justify-between justify-center");
    			attr(div4, "class", "");
    			attr(footer, "class", "foot pb-4 svelte-1pvpdob");
    		},
    		m(target, anchor) {
    			insert(target, footer, anchor);
    			append(footer, div4);
    			append(div4, hr);
    			append(div4, t0);
    			append(div4, div3);
    			append(div3, div1);
    			append(div1, div0);
    			append(div3, t4);
    			append(div3, div2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(footer);
    		}
    	};
    }

    function instance$5($$self) {
    	let date = new Date().getFullYear();
    	return [date];
    }

    class FooterAdmin extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});
    	}
    }

    /* src/views/admin/Dashboard.svelte generated by Svelte v3.35.0 */

    function create_fragment$4(ctx) {
    	let div1;

    	return {
    		c() {
    			div1 = element("div");

    			div1.innerHTML = `<div class="pt-12 text-center text-blueGray-500 text-lg m-4" style="height: max-content">You can add new wallet by clicking &quot;+&quot; on sidebar.
    <p>Simply track your expenses and follow current cryptocurrency rates.</p></div>`;
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div1);
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { location } = $$props;

    	$$self.$$set = $$props => {
    		if ("location" in $$props) $$invalidate(0, location = $$props.location);
    	};

    	return [location];
    }

    class Dashboard extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { location: 0 });
    	}
    }

    /* src/views/admin/AddCurrency.svelte generated by Svelte v3.35.0 */

    function create_fragment$3(ctx) {
    	let div14;
    	let div2;
    	let form0;
    	let div1;
    	let h1;
    	let t1;
    	let div0;
    	let button0;
    	let t3;
    	let div13;
    	let div12;
    	let div11;
    	let form1;
    	let div4;
    	let t7;
    	let div10;
    	let div8;
    	let div5;
    	let label0;
    	let t9;
    	let input0;
    	let t10;
    	let div6;
    	let label1;
    	let t12;
    	let select;
    	let option0;
    	let option1;
    	let t15;
    	let div7;
    	let label2;
    	let t17;
    	let input1;
    	let t18;
    	let div9;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div14 = element("div");
    			div2 = element("div");
    			form0 = element("form");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Wallet with this name already exists";
    			t1 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Ok";
    			t3 = space();
    			div13 = element("div");
    			div12 = element("div");
    			div11 = element("div");
    			form1 = element("form");
    			div4 = element("div");

    			div4.innerHTML = `<div class="block pl-2 font-semibold text-xl self-start text-gray-700"><h2 class="leading-relaxed">Create a wallet</h2> 
            <p class="text-sm text-gray-500 font-normal leading-relaxed">Choose name, type of currency and initial balance.</p></div>`;

    			t7 = space();
    			div10 = element("div");
    			div8 = element("div");
    			div5 = element("div");
    			label0 = element("label");
    			label0.textContent = "Wallet title";
    			t9 = space();
    			input0 = element("input");
    			t10 = space();
    			div6 = element("div");
    			label1 = element("label");
    			label1.textContent = "Type of currency";
    			t12 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Crypto";
    			option1 = element("option");
    			option1.textContent = "Regular";
    			t15 = space();
    			div7 = element("div");
    			label2 = element("label");
    			label2.textContent = "Initial balance";
    			t17 = space();
    			input1 = element("input");
    			t18 = space();
    			div9 = element("div");
    			div9.innerHTML = `<button id="createBtn" class="text-teal-500 hover:text-white hover:bg-teal-500 border border-solid border-teal-500 focus:outline-none font-bold uppercase text-xs px-4 py-2 rounded-full outline-none ease-linear svelte-1uayuv4" type="submit">Create <i class="fas fa-angle-right"></i></button>`;
    			attr(h1, "class", "mb-6 text-2xl");
    			attr(button0, "type", "button");
    			attr(button0, "class", "cancelbtn rounded-full svelte-1uayuv4");
    			attr(div0, "class", "clearfix svelte-1uayuv4");
    			attr(div1, "class", "container svelte-1uayuv4");
    			attr(form0, "class", "modal-content svelte-1uayuv4");
    			attr(div2, "id", "id01");
    			attr(div2, "class", "modal items-center md:ml-64 svelte-1uayuv4");
    			div2.hidden = /*modalHidden*/ ctx[3];
    			attr(div4, "class", "flex items-center");
    			attr(label0, "class", "leading-loose");
    			attr(input0, "type", "text");
    			attr(input0, "class", "px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600");
    			attr(input0, "placeholder", "Currency name");
    			input0.required = true;
    			attr(div5, "class", "flex flex-col pb-4");
    			option0.__value = "crypto";
    			option0.value = option0.__value;
    			option1.__value = "regular";
    			option1.value = option1.__value;
    			attr(select, "class", "px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600");
    			if (/*currency*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[9].call(select));
    			attr(div6, "class", "flex flex-col pb-4");
    			attr(label2, "class", "leading-loose");
    			attr(input1, "type", "text");
    			attr(input1, "class", "px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600");
    			attr(input1, "placeholder", "0");
    			input1.required = true;
    			attr(div7, "class", "flex flex-col");
    			attr(div8, "class", "py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7");
    			attr(div9, "class", "flex-col flex text-right focus:outline-none");
    			attr(div10, "class", "");
    			attr(div11, "class", "bg-white md:mx-0 shadow sm:p-10 p-8 mb-24");
    			attr(div12, "class", "sm:max-w-xl sm:mx-auto");
    			attr(div13, "class", "flex justify-center sm:pt-12");
    			attr(div14, "class", "");
    		},
    		m(target, anchor) {
    			insert(target, div14, anchor);
    			append(div14, div2);
    			append(div2, form0);
    			append(form0, div1);
    			append(div1, h1);
    			append(div1, t1);
    			append(div1, div0);
    			append(div0, button0);
    			append(div14, t3);
    			append(div14, div13);
    			append(div13, div12);
    			append(div12, div11);
    			append(div11, form1);
    			append(form1, div4);
    			append(form1, t7);
    			append(form1, div10);
    			append(div10, div8);
    			append(div8, div5);
    			append(div5, label0);
    			append(div5, t9);
    			append(div5, input0);
    			set_input_value(input0, /*title*/ ctx[0]);
    			append(div8, t10);
    			append(div8, div6);
    			append(div6, label1);
    			append(div6, t12);
    			append(div6, select);
    			append(select, option0);
    			append(select, option1);
    			select_option(select, /*currency*/ ctx[1]);
    			append(div8, t15);
    			append(div8, div7);
    			append(div7, label2);
    			append(div7, t17);
    			append(div7, input1);
    			set_input_value(input1, /*balance*/ ctx[2]);
    			append(div10, t18);
    			append(div10, div9);

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*click_handler*/ ctx[6]),
    					listen(div2, "click", /*click_handler_1*/ ctx[7]),
    					listen(input0, "input", /*input0_input_handler*/ ctx[8]),
    					listen(select, "change", /*select_change_handler*/ ctx[9]),
    					listen(input1, "input", /*input1_input_handler*/ ctx[10]),
    					listen(form1, "submit", prevent_default(/*addPurse*/ ctx[4]))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*modalHidden*/ 8) {
    				div2.hidden = /*modalHidden*/ ctx[3];
    			}

    			if (dirty & /*title*/ 1 && input0.value !== /*title*/ ctx[0]) {
    				set_input_value(input0, /*title*/ ctx[0]);
    			}

    			if (dirty & /*currency*/ 2) {
    				select_option(select, /*currency*/ ctx[1]);
    			}

    			if (dirty & /*balance*/ 4 && input1.value !== /*balance*/ ctx[2]) {
    				set_input_value(input1, /*balance*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div14);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $purses;
    	component_subscribe($$self, purses, $$value => $$invalidate(11, $purses = $$value));
    	let { location } = $$props;
    	let title;
    	let currency;
    	let balance;
    	let modalHidden = true;

    	function validateInput(input) {
    		for (let i = 0; i < $purses.length; i++) {
    			if ($purses[i].title === input) {
    				$$invalidate(3, modalHidden = false);
    				console.log("purses.title match");
    				return false;
    			}
    		}

    		// if(isNaN(input)){
    		//   console.log("NAN")
    		//   return false;
    		// }
    		if (input.toString().startsWith("+") || input.toString().startsWith("-")) {
    			return false;
    		}

    		return true;
    	}

    	function addPurse() {
    		if (!title || !currency || !balance) {
    			return;
    		}

    		if (balance.isNaN) return;
    		if (!validateInput(title)) return;
    		const purse = new Purse();
    		purse.title = title;
    		purse.currency = currency;
    		purse.total = new Total();
    		purse.total.balance = +balance;
    		set_store_value(purses, $purses = [...$purses, purse], $purses);
    		navi();
    		$$invalidate(0, title = "");
    		$$invalidate(1, currency = "");
    		$$invalidate(2, balance = "");
    	}

    	function navi() {
    		navigate("/admin/purse/" + title, { replace: true });
    	}

    	const click_handler = () => $$invalidate(3, modalHidden = true);
    	const click_handler_1 = () => $$invalidate(3, modalHidden = true);

    	function input0_input_handler() {
    		title = this.value;
    		$$invalidate(0, title);
    	}

    	function select_change_handler() {
    		currency = select_value(this);
    		$$invalidate(1, currency);
    	}

    	function input1_input_handler() {
    		balance = this.value;
    		$$invalidate(2, balance);
    	}

    	$$self.$$set = $$props => {
    		if ("location" in $$props) $$invalidate(5, location = $$props.location);
    	};

    	return [
    		title,
    		currency,
    		balance,
    		modalHidden,
    		addPurse,
    		location,
    		click_handler,
    		click_handler_1,
    		input0_input_handler,
    		select_change_handler,
    		input1_input_handler
    	];
    }

    class AddCurrency extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { location: 5 });
    	}
    }

    /* src/views/admin/Expenses.svelte generated by Svelte v3.35.0 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (193:16) {#each purse.expenses as expense}
    function create_each_block(ctx) {
    	let button;
    	let t0;
    	let li;
    	let div2;
    	let div0;
    	let t1_value = /*expense*/ ctx[15].typeOfTransaction + "";
    	let t1;
    	let t2_value = /*expense*/ ctx[15].input + "";
    	let t2;
    	let t3;
    	let div1;
    	let t4_value = /*expense*/ ctx[15].now + "";
    	let t4;
    	let t5;
    	let li_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			t0 = space();
    			li = element("li");
    			div2 = element("div");
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = text(t2_value);
    			t3 = space();
    			div1 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			attr(button, "type", "button");
    			attr(button, "class", "m-0 focus:outline-none text-right inline far fa-times-circle hover:text-red-600");
    			attr(div0, "class", "pl-4 font-bold");
    			attr(div1, "class", "text-right font-normal");
    			attr(div2, "class", "grid grid-cols-2 p-3");

    			attr(li, "class", li_class_value = "border rounded-full p-2  " + (/*expense*/ ctx[15].typeOfTransaction === "+"
    			? "border-teal-500"
    			: "border-red-500") + " ");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			insert(target, t0, anchor);
    			insert(target, li, anchor);
    			append(li, div2);
    			append(div2, div0);
    			append(div0, t1);
    			append(div0, t2);
    			append(div2, t3);
    			append(div2, div1);
    			append(div1, t4);
    			append(li, t5);

    			if (!mounted) {
    				dispose = listen(button, "click", function () {
    					if (is_function(/*deleteExpense*/ ctx[5](/*expense*/ ctx[15].id))) /*deleteExpense*/ ctx[5](/*expense*/ ctx[15].id).apply(this, arguments);
    				});

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*purse*/ 1 && t1_value !== (t1_value = /*expense*/ ctx[15].typeOfTransaction + "")) set_data(t1, t1_value);
    			if (dirty & /*purse*/ 1 && t2_value !== (t2_value = /*expense*/ ctx[15].input + "")) set_data(t2, t2_value);
    			if (dirty & /*purse*/ 1 && t4_value !== (t4_value = /*expense*/ ctx[15].now + "")) set_data(t4, t4_value);

    			if (dirty & /*purse*/ 1 && li_class_value !== (li_class_value = "border rounded-full p-2  " + (/*expense*/ ctx[15].typeOfTransaction === "+"
    			? "border-teal-500"
    			: "border-red-500") + " ")) {
    				attr(li, "class", li_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			if (detaching) detach(t0);
    			if (detaching) detach(li);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	let div14;
    	let div2;
    	let form;
    	let div1;
    	let h1;
    	let t1;
    	let div0;
    	let button0;
    	let t3;
    	let button1;
    	let t5;
    	let div3;
    	let t6;
    	let p0;
    	let t7_value = /*purse*/ ctx[0].total.balance + "";
    	let t7;
    	let t8;
    	let div7;
    	let div4;
    	let t9;
    	let p1;
    	let t10;
    	let t11_value = /*purse*/ ctx[0].total.incomes + "";
    	let t11;
    	let t12;
    	let div5;
    	let t14;
    	let div6;
    	let t15;
    	let p2;
    	let t16;
    	let t17_value = /*purse*/ ctx[0].total.outcomes + "";
    	let t17;
    	let t18;
    	let div13;
    	let div9;
    	let div8;
    	let span;
    	let select;
    	let option0;
    	let option1;
    	let t21;
    	let input_1;
    	let t22;
    	let button2;
    	let t23;
    	let div11;
    	let p3;
    	let t25;
    	let div10;
    	let button3;
    	let t27;
    	let div12;
    	let ul;
    	let mounted;
    	let dispose;
    	let each_value = /*purse*/ ctx[0].expenses;
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div14 = element("div");
    			div2 = element("div");
    			form = element("form");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Are you sure you want to delete this wallet?";
    			t1 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Cancel";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "Delete";
    			t5 = space();
    			div3 = element("div");
    			t6 = text("Balance:\n        ");
    			p0 = element("p");
    			t7 = text(t7_value);
    			t8 = space();
    			div7 = element("div");
    			div4 = element("div");
    			t9 = text("Incomes:\n            ");
    			p1 = element("p");
    			t10 = text("+");
    			t11 = text(t11_value);
    			t12 = space();
    			div5 = element("div");
    			div5.textContent = "|";
    			t14 = space();
    			div6 = element("div");
    			t15 = text("Outcomes:\n            ");
    			p2 = element("p");
    			t16 = text("-");
    			t17 = text(t17_value);
    			t18 = space();
    			div13 = element("div");
    			div9 = element("div");
    			div8 = element("div");
    			span = element("span");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "+";
    			option1 = element("option");
    			option1.textContent = "-";
    			t21 = space();
    			input_1 = element("input");
    			t22 = space();
    			button2 = element("button");
    			button2.innerHTML = `<img src="" class="imb mb-1 fas fa-plus svelte-vdig2c" alt=""/>`;
    			t23 = space();
    			div11 = element("div");
    			p3 = element("p");
    			p3.innerHTML = `History <i class="fas fa-history"></i>`;
    			t25 = space();
    			div10 = element("div");
    			button3 = element("button");
    			button3.textContent = "Delete wallet";
    			t27 = space();
    			div12 = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(h1, "class", "mb-6 text-2xl");
    			attr(button0, "type", "button");
    			attr(button0, "class", "cancelbtn rounded-full svelte-vdig2c");
    			attr(button1, "type", "button");
    			attr(button1, "class", "deletebtn rounded-full svelte-vdig2c");
    			attr(div0, "class", "clearfix svelte-vdig2c");
    			attr(div1, "class", "container svelte-vdig2c");
    			attr(form, "class", "modal-content svelte-vdig2c");
    			attr(div2, "id", "id01");
    			attr(div2, "class", "modal items-center md:ml-64 svelte-vdig2c");
    			div2.hidden = /*modalHidden*/ ctx[3];
    			attr(p0, "id", "balance");
    			attr(p0, "class", "inline text-lightBlue-600");
    			attr(div3, "class", "text-xl text-center flex-auto uppercase");
    			attr(p1, "id", "incomes");
    			attr(p1, "class", "inline text-teal-500");
    			attr(div4, "class", "inline");
    			attr(div5, "class", "inline px-2 md:");
    			attr(p2, "id", "outcomes");
    			attr(p2, "class", "inline text-red-500");
    			attr(div6, "class", "inline");
    			attr(div7, "class", "text-center uppercase text-lg");
    			option0.__value = "+";
    			option0.value = option0.__value;
    			option1.__value = "-";
    			option1.value = option1.__value;
    			attr(select, "id", "select");
    			attr(select, "class", "border-0 rounded-full");
    			if (/*typeOfTransaction*/ ctx[2] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[11].call(select));
    			attr(span, "class", "");
    			attr(div8, "class", "p-2 mr-1 rounded-full hover:bg-gray-100");
    			attr(input_1, "id", "input_expense");
    			attr(input_1, "class", "font-bold uppercase rounded-full w-full py-4 pl-4 text-gray-700 bg-gray-100  lg:text-sm text-xs");
    			attr(input_1, "type", "text");
    			attr(input_1, "placeholder", "Value");
    			attr(button2, "id", "button_expense");
    			attr(button2, "type", "button");
    			attr(button2, "class", "m-3 border-0 focus:outline-none");
    			attr(div9, "class", "bg-white items-center justify-between w-full flex rounded-full shadow-lg p-2 mb-5 ");
    			attr(p3, "class", "m-4 font-bold");
    			attr(button3, "type", "button");
    			attr(button3, "class", "bdl border border-red-500 bg-red-500 p-2 rounded-full shadow-md focus:outline-none   svelte-vdig2c");
    			attr(div10, "class", "text-right text-white uppercase m-2 ");
    			attr(div11, "class", "grid grid-cols-2 text-xl uppercase ");
    			attr(ul, "id", "trans");
    			attr(div12, "class", "flex flex-col py-3 pb-16");
    			attr(div13, "class", "flex flex-col p-2 py-6 ");
    			attr(div14, "class", "mb-24");
    		},
    		m(target, anchor) {
    			insert(target, div14, anchor);
    			append(div14, div2);
    			append(div2, form);
    			append(form, div1);
    			append(div1, h1);
    			append(div1, t1);
    			append(div1, div0);
    			append(div0, button0);
    			append(div0, t3);
    			append(div0, button1);
    			append(div14, t5);
    			append(div14, div3);
    			append(div3, t6);
    			append(div3, p0);
    			append(p0, t7);
    			append(div14, t8);
    			append(div14, div7);
    			append(div7, div4);
    			append(div4, t9);
    			append(div4, p1);
    			append(p1, t10);
    			append(p1, t11);
    			append(div7, t12);
    			append(div7, div5);
    			append(div7, t14);
    			append(div7, div6);
    			append(div6, t15);
    			append(div6, p2);
    			append(p2, t16);
    			append(p2, t17);
    			append(div14, t18);
    			append(div14, div13);
    			append(div13, div9);
    			append(div9, div8);
    			append(div8, span);
    			append(span, select);
    			append(select, option0);
    			append(select, option1);
    			select_option(select, /*typeOfTransaction*/ ctx[2]);
    			append(div9, t21);
    			append(div9, input_1);
    			set_input_value(input_1, /*input*/ ctx[1]);
    			append(div9, t22);
    			append(div9, button2);
    			append(div13, t23);
    			append(div13, div11);
    			append(div11, p3);
    			append(div11, t25);
    			append(div11, div10);
    			append(div10, button3);
    			append(div13, t27);
    			append(div13, div12);
    			append(div12, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*click_handler*/ ctx[9]),
    					listen(button1, "click", /*deleteWallet*/ ctx[6]),
    					listen(div2, "click", /*click_handler_1*/ ctx[10]),
    					listen(select, "change", /*select_change_handler*/ ctx[11]),
    					listen(input_1, "input", /*input_1_input_handler*/ ctx[12]),
    					listen(button2, "click", /*handlerPlus*/ ctx[4]),
    					listen(button3, "click", /*click_handler_2*/ ctx[13])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*modalHidden*/ 8) {
    				div2.hidden = /*modalHidden*/ ctx[3];
    			}

    			if (dirty & /*purse*/ 1 && t7_value !== (t7_value = /*purse*/ ctx[0].total.balance + "")) set_data(t7, t7_value);
    			if (dirty & /*purse*/ 1 && t11_value !== (t11_value = /*purse*/ ctx[0].total.incomes + "")) set_data(t11, t11_value);
    			if (dirty & /*purse*/ 1 && t17_value !== (t17_value = /*purse*/ ctx[0].total.outcomes + "")) set_data(t17, t17_value);

    			if (dirty & /*typeOfTransaction*/ 4) {
    				select_option(select, /*typeOfTransaction*/ ctx[2]);
    			}

    			if (dirty & /*input*/ 2 && input_1.value !== /*input*/ ctx[1]) {
    				set_input_value(input_1, /*input*/ ctx[1]);
    			}

    			if (dirty & /*purse, deleteExpense*/ 33) {
    				each_value = /*purse*/ ctx[0].expenses;
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div14);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function validateInput(input) {
    	if (isNaN(input)) {
    		return false;
    	}

    	if (input.toString().startsWith("+") || input.toString().startsWith("-")) {
    		return false;
    	}

    	if (input.toString().startsWith("0.")) return true;
    	if (input.toString().startsWith("0")) return false;
    	return true;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $purses;
    	component_subscribe($$self, purses, $$value => $$invalidate(8, $purses = $$value));
    	let { purseTitle } = $$props;
    	let purse;
    	let input = 0;
    	let typeOfTransaction = "+";
    	let modalHidden = true;

    	function handlerPlus() {
    		if (!validateInput(input)) return;
    		let date = Date.now();
    		let now = new Date(date).toLocaleString();

    		Purse.updatePurseByTitle(purseTitle, purse => {
    			if (typeOfTransaction === "+") {
    				// $tempStore[0].balance += +input;
    				// purse.total.balance = +input;
    				purse.total.balance += +input;

    				purse.total.incomes += +input;
    			} else {
    				purse.total.balance -= +input;
    				purse.total.outcomes += +input;
    			}

    			const expense = {
    				typeOfTransaction,
    				input,
    				now,
    				id: purse.expenses.length > 0
    				? purse.expenses[purse.expenses.length - 1].id + 1
    				: 1
    			};

    			purse.expenses = [...purse.expenses, expense];

    			purse.expenses.sort(function (a, b) {
    				return b.now.localeCompare(a.now);
    			});
    		});
    	}

    	function deleteExpense(id) {
    		for (let i = 0; i < purse.expenses.length; i++) {
    			if (purse.expenses[i].id === id) {
    				if (purse.expenses[i].typeOfTransaction === "+") {
    					$$invalidate(0, purse.total.balance -= +purse.expenses[i].input, purse);
    					$$invalidate(0, purse.total.incomes -= +purse.expenses[i].input, purse);
    				} else {
    					$$invalidate(0, purse.total.balance += +purse.expenses[i].input, purse);
    					$$invalidate(0, purse.total.outcomes -= +purse.expenses[i].input, purse);
    				}

    				purse.expenses.splice(i, 1);
    			}
    		}

    		Purse.updatePurseByTitle(purseTitle);
    	}

    	function deleteWallet() {
    		Purse.deletePurseFromPurses(purseTitle);
    		navi();
    	}

    	window.onload = () => {
    		document.getElementById("input_expense").addEventListener("keyup", function (event) {
    			event.preventDefault();

    			if (event.code === "Enter") {
    				document.getElementById("button_expense").click();
    			}
    		});
    	};

    	function navi() {
    		navigate("/admin/dashboard", { replace: true });
    	}

    	const click_handler = () => $$invalidate(3, modalHidden = true);
    	const click_handler_1 = () => $$invalidate(3, modalHidden = true);

    	function select_change_handler() {
    		typeOfTransaction = select_value(this);
    		$$invalidate(2, typeOfTransaction);
    	}

    	function input_1_input_handler() {
    		input = this.value;
    		$$invalidate(1, input);
    	}

    	const click_handler_2 = () => $$invalidate(3, modalHidden = false);

    	$$self.$$set = $$props => {
    		if ("purseTitle" in $$props) $$invalidate(7, purseTitle = $$props.purseTitle);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$purses, purseTitle*/ 384) {
    			$$invalidate(0, purse = $purses.filter(p => p.title === purseTitle)[0] || new Purse());
    		}
    	};

    	return [
    		purse,
    		input,
    		typeOfTransaction,
    		modalHidden,
    		handlerPlus,
    		deleteExpense,
    		deleteWallet,
    		purseTitle,
    		$purses,
    		click_handler,
    		click_handler_1,
    		select_change_handler,
    		input_1_input_handler,
    		click_handler_2
    	];
    }

    class Expenses extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { purseTitle: 7 });
    	}
    }

    /* src/layouts/Admin.svelte generated by Svelte v3.35.0 */

    function create_default_slot$1(ctx) {
    	let route0;
    	let t0;
    	let route1;
    	let t1;
    	let route2;
    	let current;

    	route0 = new Route({
    			props: { path: "dashboard", component: Dashboard }
    		});

    	route1 = new Route({
    			props: { path: "plus", component: AddCurrency }
    		});

    	route2 = new Route({
    			props: {
    				path: "purse/:purseTitle",
    				component: Expenses
    			}
    		});

    	return {
    		c() {
    			create_component(route0.$$.fragment);
    			t0 = space();
    			create_component(route1.$$.fragment);
    			t1 = space();
    			create_component(route2.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(route1, target, anchor);
    			insert(target, t1, anchor);
    			mount_component(route2, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach(t0);
    			destroy_component(route1, detaching);
    			if (detaching) detach(t1);
    			destroy_component(route2, detaching);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let sidebar;
    	let t0;
    	let div1;
    	let adminnavbar;
    	let t1;
    	let headerstats;
    	let t2;
    	let div0;
    	let router;
    	let t3;
    	let footeradmin;
    	let current;
    	sidebar = new Sidebar({ props: { location: /*location*/ ctx[0] } });
    	adminnavbar = new AdminNavbar({});
    	headerstats = new HeaderStats({});

    	router = new Router({
    			props: {
    				url: "admin",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			}
    		});

    	footeradmin = new FooterAdmin({});

    	return {
    		c() {
    			div2 = element("div");
    			create_component(sidebar.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(adminnavbar.$$.fragment);
    			t1 = space();
    			create_component(headerstats.$$.fragment);
    			t2 = space();
    			div0 = element("div");
    			create_component(router.$$.fragment);
    			t3 = space();
    			create_component(footeradmin.$$.fragment);
    			attr(div0, "class", "md:px-10  w-full bg-blueGray-100 pt-6");
    			attr(div1, "class", "relative md:ml-64 bg-blueGray-100");
    			set_style(div1, "height", "100vh");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			mount_component(sidebar, div2, null);
    			append(div2, t0);
    			append(div2, div1);
    			mount_component(adminnavbar, div1, null);
    			append(div1, t1);
    			mount_component(headerstats, div1, null);
    			append(div1, t2);
    			append(div1, div0);
    			mount_component(router, div0, null);
    			append(div0, t3);
    			mount_component(footeradmin, div0, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const sidebar_changes = {};
    			if (dirty & /*location*/ 1) sidebar_changes.location = /*location*/ ctx[0];
    			sidebar.$set(sidebar_changes);
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(sidebar.$$.fragment, local);
    			transition_in(adminnavbar.$$.fragment, local);
    			transition_in(headerstats.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			transition_in(footeradmin.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(sidebar.$$.fragment, local);
    			transition_out(adminnavbar.$$.fragment, local);
    			transition_out(headerstats.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			transition_out(footeradmin.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			destroy_component(sidebar);
    			destroy_component(adminnavbar);
    			destroy_component(headerstats);
    			destroy_component(router);
    			destroy_component(footeradmin);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { location } = $$props;
    	let { admin = "" } = $$props;

    	$$self.$$set = $$props => {
    		if ("location" in $$props) $$invalidate(0, location = $$props.location);
    		if ("admin" in $$props) $$invalidate(1, admin = $$props.admin);
    	};

    	return [location, admin];
    }

    class Admin extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { location: 0, admin: 1 });
    	}
    }

    /* src/App.svelte generated by Svelte v3.35.0 */

    function create_default_slot(ctx) {
    	let route;
    	let current;

    	route = new Route({
    			props: { path: "admin/*admin", component: Admin }
    		});

    	return {
    		c() {
    			create_component(route.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(route, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(route.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(route.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(route, detaching);
    		}
    	};
    }

    function create_fragment(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(router.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope*/ 4) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(router, detaching);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { url = "" } = $$props;

    	window.addEventListener("load", function () {
    		function updateOnlineStatus(event) {
    			if (!navigator.onLine) {
    				navi("/offline.html");
    				setTimeout("", 1);
    				location.reload();
    			} else {
    				navi("/admin/dashboard");
    			}
    		}

    		window.addEventListener("online", updateOnlineStatus);
    		window.addEventListener("offline", updateOnlineStatus);
    		navigate("/admin/dashboard", { replace: true });
    	});

    	function navi(url) {
    		navigate(url, { replace: true });
    	}

    	$$self.$$set = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	return [url];
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, { url: 0 });
    	}
    }

    // import cache from './sw_cached_pages.js';
    const app = new App({

      target: document.getElementById("app"),
    });



    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
            .register( `../../sw_cached_pages.js`,)
            .then(req => console.log('Service Worker: Registered (Pages)'))
            .catch(err => console.log(`Service Worker: Error: ${err}`));
      });
    }

    return app;

}());
//# sourceMappingURL=bundle.js.map
