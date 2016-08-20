"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function e(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(t,n,i){return n&&e(t.prototype,n),i&&e(t,i),t}}(),YuanImageUpload=function(){function e(t,n){_classCallCheck(this,e);var i=t.getAttribute("data-preview"),a=t.getAttribute("data-input");this.fileControl=t,this.previewContainer=document.getElementById(i),this.inputControl=document.getElementById(a),this.options={},this.parseOptions(n),this.setInputControlPredefinedValue(),this.createPrefinedImgContainers(),this.addEventListeners()}return _createClass(e,[{key:"parseOptions",value:function(t){return!!t&&void e.extend(this.options,t)}},{key:"setInputControlPredefinedValue",value:function(){this.options.imgIds&&(this.inputControl.value=this.options.imgIds.join(";"))}},{key:"createPrefinedImgContainers",value:function(){if(this.options.imgURLs)for(var t=0,n=this.options.imgURLs.length;t<n;t++){var i=e.generateUUID();this.createImgContainer(this.options.imgURLs[t],i),document.getElementById(i).setAttribute("data-imgid",this.options.imgIds[t])}}},{key:"addEventListeners",value:function(){var e=this;this.fileControl.addEventListener("change",function(t){t.preventDefault(),t.stopPropagation(),e.handleFiles()},!1),this.previewContainer.addEventListener("click",function(t){t.stopPropagation(),t.preventDefault();var n=t.target,i=n.classList;i.contains("removeIcon")?e.handleRemoveImage(n.parentElement):i.contains("imgContainer")&&e.previewImg(n.id)})}},{key:"previewImg",value:function(e){this.options.onPreview&&this.options.onPreview.call(this,e)}},{key:"handleRemoveImage",value:function(e){var t=e.getAttribute("data-imgid");e.parentNode.removeChild(e);var n=this.inputControl.value.trim();if(n){var i=n.split(";"),a=i.indexOf(t);a>-1&&i.splice(a,1),this.inputControl.value=i.join(";")}}},{key:"handleFiles",value:function(){for(var t=this.fileControl.files,n=t.length,i=0;i<n;i++){var a=t[i],o=/^image\//;if(o.test(a.type)){var r=e.generateUUID();this.createImgContainer(a,r),this.sendFile(a,r)}}}},{key:"createImgContainer",value:function(e,t){var n=document.createElement("div");n.classList.add("imgContainer"),n.id=t;var i=document.createElement("img");if(i.src="../images/del.png",i.classList.add("removeIcon"),"string"==typeof e)n.style.backgroundImage="url("+e+")";else{var a=new FileReader;a.onload=function(e){n.style.backgroundImage="url("+e.target.result+")"},a.readAsDataURL(e)}n.appendChild(i),this.previewContainer.appendChild(n)}},{key:"sendFile",value:function(e,t){var n=this,i=new XMLHttpRequest,a=new FormData,o="responseType"in i;i.open("POST",this.options.uploadURL,!0),o&&(i.responseType="json"),i.onreadystatechange=function(){if(4==i.readyState&&200==i.status){var e=o?i.response:JSON.parse(i.responseText);n.handleUploadResponse(e,t)}};var r=this.fileControl.getAttribute("name")||"myFile";a.append(r,e),i.send(a)}},{key:"handleUploadResponse",value:function(e,t){if(this.options.onUploadSuccess){var n=this.options.onUploadSuccess.call(this,e);this._handleUploadSuccess(n,t)}}},{key:"_handleUploadSuccess",value:function(e,t){this.inputControl.value?this.inputControl.value+=";"+e:this.inputControl.value=e,document.getElementById(t).setAttribute("data-imgid",e)}}],[{key:"generateUUID",value:function(){var e=(new Date).getTime(),t="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(t){var n=(e+16*Math.random())%16|0;return e=Math.floor(e/16),("x"==t?n:7&n|8).toString(16)});return t}},{key:"extend",value:function(){for(var e=1;e<arguments.length;e++)for(var t in arguments[e])arguments[e].hasOwnProperty(t)&&(arguments[0][t]=arguments[e][t]);return arguments[0]}}]),e}();