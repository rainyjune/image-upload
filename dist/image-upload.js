"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function e(e,t){for(var n=0;n<t.length;n++){var a=t[n];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}return function(t,n,a){return n&&e(t.prototype,n),a&&e(t,a),t}}(),YuanImageUpload=function(){function e(t,n){_classCallCheck(this,e),this.uploadButton=t;var a=t.getAttribute("data-for"),i=t.getAttribute("data-preview"),r=t.getAttribute("data-input");this.fileControl=document.getElementById(a),this.previewContainer=document.getElementById(i),this.inputControl=document.getElementById(r),this.counter=e.counter(),this.parseOptions(n),this.addEventListeners()}return _createClass(e,[{key:"parseOptions",value:function(e){return!!e&&(e.uploadURL&&(this.uploadURL=e.uploadURL),void(e.onPreview&&(this.onPreview=e.onPreview)))}},{key:"addEventListeners",value:function(){var e=this;this.uploadButton.addEventListener("click",function(t){e.fileControl.click(),t.preventDefault(),t.stopPropagation()},!1),this.fileControl.addEventListener("change",function(t){e.handleFiles(),t.preventDefault(),t.stopPropagation()},!1),this.previewContainer.addEventListener("click",function(t){t.stopPropagation(),t.preventDefault();var n=t.target,a=n.classList;a.contains("removeIcon")?e.handleRemoveImage(n.parentElement):a.contains("imgContainer")&&e.previewImg(n.id)})}},{key:"previewImg",value:function(e){this.onPreview&&this.onPreview.call(this,e)}},{key:"handleRemoveImage",value:function(e){var t=e.getAttribute("data-imgid");e.parentNode.removeChild(e);var n=this.inputControl.value.trim();if(n){var a=n.split(";"),i=a.indexOf(t);i>-1&&a.splice(i,1),this.inputControl.value=a.join(";")}}},{key:"handleFiles",value:function(){for(var e=this.fileControl.files,t=e.length,n=0;n<t;n++){var a=e[n],i=/^image\//;if(i.test(a.type)){var r="f"+this.counter();this.createImgContainer(a,r),this.sendFile(a,r)}}}},{key:"createImgContainer",value:function(e,t){var n=document.createElement("div");n.classList.add("imgContainer"),n.id=t;var a=document.createElement("img");a.src="../images/del.png",a.classList.add("removeIcon");var i=new FileReader;i.onload=function(e){n.style.backgroundImage="url("+e.target.result+")"},i.readAsDataURL(e),n.appendChild(a),this.previewContainer.appendChild(n)}},{key:"sendFile",value:function(e,t){var n=this,a=new XMLHttpRequest,i=new FormData,r="responseType"in a;a.open("POST",this.uploadURL,!0),r&&(a.responseType="json"),a.onreadystatechange=function(){if(4==a.readyState&&200==a.status){var e=r?a.response:JSON.parse(a.responseText);n.handleUploadResponse(e,t)}},i.append("myFile",e),a.send(i)}},{key:"handleUploadResponse",value:function(e,t){e.success&&(this.inputControl.value?this.inputControl.value+=";"+e.url:this.inputControl.value=e.url,document.getElementById(t).setAttribute("data-imgid",e.url))}}],[{key:"counter",value:function(){var e=0;return function(){return e++}}}]),e}();