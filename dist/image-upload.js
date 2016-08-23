'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var YuanImageUpload = function () {
  function YuanImageUpload(fileControl, options) {
    _classCallCheck(this, YuanImageUpload);

    var previewContainerId = fileControl.getAttribute('data-preview'),
        inputControlId = fileControl.getAttribute('data-input');

    this.fileControl = fileControl;
    // The div output where the content will be displayed.
    this.previewContainer = document.getElementById(previewContainerId);
    this.inputControl = document.getElementById(inputControlId);
    this.options = {
      allowedExtensions: ["gif", "png", "jpg", "jpeg", "bmp"],
      removeIconUrl: "../images/del.png",
      parser: function parser() {} // Tell the library how to parse the Ajax response. A valid URL should be returned in this function.
    };
    this.parseOptions(options);
    this.setInputControlPredefinedValue();
    this.createPrefinedImgContainers();
    this.addEventListeners();
  }

  _createClass(YuanImageUpload, [{
    key: 'parseOptions',
    value: function parseOptions(options) {
      if (!options) return false;
      YuanImageUpload.extend(this.options, options);
    }
  }, {
    key: 'setInputControlPredefinedValue',
    value: function setInputControlPredefinedValue() {
      if (this.options.imgIds) {
        this.inputControl.value = this.options.imgIds.join(';');
      }
    }
  }, {
    key: 'createPrefinedImgContainers',
    value: function createPrefinedImgContainers() {
      if (this.options.imgURLs) {
        for (var i = 0, len = this.options.imgURLs.length; i < len; i++) {
          var fileLocalId = YuanImageUpload.generateUUID();
          this.createImgContainer(this.options.imgURLs[i], fileLocalId);
          document.getElementById(fileLocalId).setAttribute('data-imgid', this.options.imgIds[i]);
        }
      }
    }
  }, {
    key: 'addEventListeners',
    value: function addEventListeners() {
      var _this = this;

      this.fileControl.addEventListener('change', function (e) {
        e.preventDefault();
        e.stopPropagation();
        _this.handleFiles();
      }, false);

      this.previewContainer.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        var target = e.target,
            targetClassList = target.classList;
        if (targetClassList.contains("removeIcon")) {
          _this.handleRemoveImage(target.parentElement || target.parentNode);
        } else if (targetClassList.contains("imgContainer")) {
          _this.previewImg(target.id);
        }
      });
    }
  }, {
    key: 'addEventListener',
    value: function addEventListener(eventName, callback) {
      // 'uploaded'
      // 'errorupload'
      this.fileControl.addEventListener(eventName, callback, false);
    }
  }, {
    key: 'removeEventListener',
    value: function removeEventListener(eventName, callback) {
      this.fileControl.removeEventListener(eventName, callback, false);
    }
  }, {
    key: 'trigger',
    value: function trigger(eventName, customData) {
      var event = new CustomEvent(eventName, {
        detail: customData || null
      });
      this.fileControl.dispatchEvent(event);
    }

    // TODO

  }, {
    key: 'previewImg',
    value: function previewImg(imgContainerId) {
      if (this.options.onPreview) {
        this.options.onPreview.call(this, imgContainerId);
      }
    }
  }, {
    key: 'handleRemoveImage',
    value: function handleRemoveImage(imgContainer) {
      var imgid = imgContainer.getAttribute('data-imgid');
      imgContainer.parentNode.removeChild(imgContainer);

      var inputControlVal = this.inputControl.value.trim();
      if (inputControlVal) {
        var inputControlValArr = inputControlVal.split(";");
        var index = inputControlValArr.indexOf(imgid);
        if (index > -1) {
          inputControlValArr.splice(index, 1);
        }
        this.inputControl.value = inputControlValArr.join(";");
      }
    }
  }, {
    key: 'handleFiles',
    value: function handleFiles() {
      var files = this.fileControl.files,
          fileLength = files.length;

      for (var i = 0; i < fileLength; i++) {
        var file = files[i];
        var imageType = /^image\//;

        if (this.options.maxSizeEachFile && file.size > this.options.maxSizeEachFile) {
          continue;
        }

        if (!imageType.test(file.type)) {
          continue;
        }
        var extension = file.name.split('.').pop();
        if (this.options.allowedExtensions.indexOf(extension) === -1) {
          continue;
        }

        var fileLocalId = YuanImageUpload.generateUUID();
        this.createImgContainer(file, fileLocalId);
        this.sendFile(file, fileLocalId);
      }
    }
  }, {
    key: 'createImgContainer',
    value: function createImgContainer(file, fileLocalId) {
      var container = document.createElement("div");
      container.classList.add('imgContainer');
      container.id = fileLocalId;

      var removeIcon = document.createElement("img");
      removeIcon.src = this.options.removeIconUrl;
      removeIcon.classList.add('removeIcon');

      if (typeof file === "string") {
        container.style.backgroundImage = "url(" + file + ")";
      } else {
        var reader = new FileReader();
        reader.onload = function (e) {
          container.style.backgroundImage = "url(" + e.target.result + ")";
        };
        reader.readAsDataURL(file);
      }

      container.appendChild(removeIcon);
      this.previewContainer.appendChild(container);
    }
  }, {
    key: 'sendFile',
    value: function sendFile(file, fileLocalId) {
      var _this2 = this;

      var xhr = new XMLHttpRequest();
      var fd = new FormData();

      xhr.open("POST", this.options.uploadURL, true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            var responseJSON = JSON.parse(xhr.responseText);
            _this2.handleUploadResponse(responseJSON, fileLocalId);
            _this2.trigger('uploaded', { responseJSON: responseJSON, fileLocalId: fileLocalId });
          } else {
            _this2.trigger('errorupload', { xhr: xhr, fileLocalId: fileLocalId });
          }
        }
      };
      var fieldName = this.fileControl.getAttribute('name') || 'myFile';
      fd.append(fieldName, file);

      xhr.send(fd); // Initiate a multipart/form-data upload
    }
  }, {
    key: 'handleUploadResponse',
    value: function handleUploadResponse(responseJSON, fileLocalId) {
      if (this.options.parser) {
        var imgId = this.options.parser.call(this, responseJSON);
        this._handleUploadSuccess(imgId, fileLocalId);
      }
    }
  }, {
    key: '_handleUploadSuccess',
    value: function _handleUploadSuccess(imgId, fileLocalId) {
      if (this.inputControl.value) {
        this.inputControl.value += ';' + imgId;
      } else {
        this.inputControl.value = imgId;
      }
      document.getElementById(fileLocalId).setAttribute('data-imgid', imgId);
    }
  }], [{
    key: 'generateUUID',
    value: function generateUUID() {
      var d = new Date().getTime();
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : r & 0x7 | 0x8).toString(16);
      });
      return uuid;
    }
  }, {
    key: 'extend',
    value: function extend() {
      for (var i = 1; i < arguments.length; i++) {
        for (var key in arguments[i]) {
          if (arguments[i].hasOwnProperty(key)) {
            arguments[0][key] = arguments[i][key];
          }
        }
      }
      return arguments[0];
    }
  }]);

  return YuanImageUpload;
}();

(function () {
  function CustomEvent(event, params) {
    params = params || { bubbles: true, cancelable: true, detail: undefined };
    if (typeof params.bubbles === "undefined") {
      params.bubbles = true;
    }
    if (typeof params.cancelable === "undefined") {
      params.cancelable = true;
    }
    var evt;
    try {
      // DOM Level 3 Events support custom event.
      evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    } catch (e) {
      // DOM Level 2 Events does not support custom event.
      evt = document.createEvent('Event');
      evt.initEvent(event, params.bubbles, params.cancelable);
      evt.detail = params.detail;
    }
    return evt;
  }
  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
})();