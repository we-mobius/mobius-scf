(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(global, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./ifanr_cigaret/cigaret_config/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./ifanr_cigaret/cigaret_config/main.js":
/*!**********************************************!*\
  !*** ./ifanr_cigaret/cigaret_config/main.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function makeResponse(content) {\r\n  return {\r\n    content: JSON.stringify(content),\r\n    content_type: 'application/json',\r\n    status_code: 200\r\n  }\r\n}\r\n\r\nasync function getConfig(options) {\r\n  try {\r\n    let { id } = options.token.data\r\n    let config\r\n\r\n    // cigaret_config: 100645\r\n    const ConfigTable = new BaaS.TableObject('cigaret_config')\r\n    const query = new BaaS.Query()\r\n\r\n    query.compare('unique_id', '=', id)\r\n\r\n    let finds = await ConfigTable.setQuery(query).find()\r\n\r\n    if (finds.status === 200 && finds.data.meta.total_count > 0) {\r\n      config = finds.data.objects[0].config\r\n    } else {\r\n      config = null\r\n    }\r\n\r\n    return {\r\n      id,\r\n      config\r\n    }\r\n  } catch (err) {\r\n    throw err\r\n  }\r\n}\r\n\r\nasync function setConfig(options) {\r\n  try {\r\n    let { id } = options.token.data\r\n    let payload = options.payload\r\n    let res\r\n\r\n    // cigaret_config: 100645\r\n    const ConfigTable = new BaaS.TableObject('cigaret_config')\r\n\r\n    const query = new BaaS.Query()\r\n    query.compare('unique_id', '=', id)\r\n    let finds = await ConfigTable.setQuery(query).find()\r\n    if (finds.status === 200) {\r\n      if (finds.data.meta.total_count > 0) {\r\n        const recordId = finds.data.objects[0]._id\r\n        const record = ConfigTable.getWithoutData(recordId)\r\n        record.set({ ...payload })\r\n        res = await record.update()\r\n      } else {\r\n        const record = ConfigTable.create()\r\n        record.set({ ...payload, unique_id: id })\r\n        res = await record.save()\r\n      }\r\n    } else {\r\n      res = { status: finds.status }\r\n    }\r\n\r\n    delete res.headers\r\n    return res\r\n  } catch (err) {\r\n    throw err\r\n  }\r\n}\r\n\r\nconst commandHandler = async (options) => {\r\n  let { action } = options\r\n  let res\r\n  switch (action) {\r\n    case 'get':\r\n      res = await getConfig(options)\r\n      break\r\n    case 'set':\r\n      res = await setConfig(options)\r\n      break\r\n  }\r\n  return res\r\n}\r\n\r\nexports.main = async function mainFn(event) {\r\n  // const command = {\r\n  //   action: 'get',\r\n  //   token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImVtYWlsIjoia2NpZ2FyZXRAb3V0bG9vay5jb20iLCJpZCI6IjVlZDRjMTlkMzcwZTg1MjI0Mjk2MDQ1NSIsImNsaWVudElkIjoiNWVhMGZjZTQ1MWJiOGQ5NDlmN2UxNzAxIn0sImlhdCI6MTU5MTI4MzY4NywiZXhwIjoxNTkyNTc5Njg3fQ.RHr0lRB0iVvpnJp0AgNiyqOgtWw9zk9nRpiuRxL-hQ8',\r\n  //   payload: {\r\n  //     config: {\r\n  //       hello: ' world!!',\r\n  //       name: 'cigaret'\r\n  //     }\r\n  //   }\r\n  // }\r\n  const command = event.data\r\n  let result\r\n\r\n  // NOTE: Do not use object format data in avoid of axios's default encode behaviour to params\r\n  let authState = await BaaS.request.get(`https://users.authing.cn/authing/token?access_token=${command.token}`)\r\n    .then(res => {\r\n      return res.data\r\n    })\r\n  // id: 5ed4c19d370e852242960455\r\n\r\n  if (authState.status === true) {\r\n    result = await commandHandler({ ...command, token: authState.token })\r\n  } else {\r\n    result = authState\r\n  }\r\n  return makeResponse(result)\r\n}\r\n\n\n//# sourceURL=webpack:///./ifanr_cigaret/cigaret_config/main.js?");

/***/ })

/******/ });
});