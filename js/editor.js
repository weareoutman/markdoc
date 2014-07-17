marked.setOptions({
	langPrefix: 'hljs ',
	highlight: function(code) {
		return hljs.highlightAuto(code).value;
	}
});

$(function() {
	var storageKey = 'markdoc',
		lastValue,
		mode = 'gfm',
		editor = $('#editor'),
		storageValue = localStorage.getItem(storageKey);
	if (storageValue) {
		editor.val(storageValue);
	}
	var mirror = CodeMirror.fromTextArea(editor[0], {
			mode: mode,
			cursorHeight: 1,
			// lineNumbers: true,
			// lineWrapping: true,
			styleActiveLine: true
		});
	var $iframe = $('iframe'),
		iframeWin = $iframe[0].contentWindow,
		$iframeWin = $(iframeWin),
		$iframeDoc = $(iframeWin.document),
		preview,
		handler,
		editorScrolling,
		previewScrolling,
		timeout = 500;
	mirror.on('change', function(mirror) {
		clearTimeout(handler);
		handler = setTimeout(render, timeout);
	});
	mirror.on('scroll', function(mirror) {
		if (previewScrolling) {
			previewScrolling = false;
			return;
		}
		editorScrolling = true;
		getPreview();
		var info = mirror.getScrollInfo();
		var top = (preview.outerHeight() - info.clientHeight) *
			info.top / (info.height - info.clientHeight);
		iframeWin.scrollTo(0, top);
	});
	$iframeWin.on('scroll', function() {
		if (editorScrolling) {
			editorScrolling = false;
			return;
		}
		previewScrolling = true;
		getPreview();
		var info = mirror.getScrollInfo();
		var top = (info.height - info.clientHeight) *
			$iframeWin.scrollTop() / (preview.outerHeight() - info.clientHeight);
		mirror.scrollTo(0, top);
	});

	function getPreview() {
		if (!(preview && preview.length > 0)) {
			preview = $(iframeWin.document).find('#container');
		}
	}

	function render(e) {
		// console.log(e);
		var value = mirror.getDoc().getValue();
		if (value === lastValue) {
			return;
		}
		lastValue = value;
		iframeWin.render(marked(value));
		localStorage.setItem(storageKey, value);
	}

	if (_previewLoaded) {
		render('preview load before');
	} else {
		window.previewLoaded = function(){
			render('preview load');
		};
	}

	$('#btn-md').click(function(){
		var content = mirror.getDoc().getValue();
		var blob = new Blob([content], {type: 'text/x-markdown;charset=utf-8'});
		saveAs(blob, 'mark.md');
	});

	function download(name, type) {
		var doc = iframeWin.document,
			head = doc.head,
			links = $(head).find('link'),
			ajaxes = [],
			text = [];
		links.each(function(i){
			ajaxes.push($.ajax({
				url: this.href
			}));
		});
		$.when.apply($, ajaxes).done(function(){
			for (var i = 0; i < arguments.length; i += 1) {
				text.push(arguments[i][0]);
			}
			var content = iframeWin.document.body.parentNode.outerHTML;
			if (content.charAt(1) !== '!') {
				content = '<!doctype html>' + content;
			}
			// Replace external styles with inline <style>
			content = content.replace(/(<link[^>]*>\s*(<\/link>)?\s*)+/, '<style type="text/css">' + text.join('\n') + '</style>');
			// Remove scripts
			content = content.replace(/<script[^>]*>[\s\S]*?<\/script>\s*/g, '');
			var blob = new Blob([content], {type: type});
			saveAs(blob, name);
		});
	}

	$('#btn-doc').click(function(){
		download('mark.doc', 'application/msword');
	});

	$('#btn-html').click(function(){
		download('mark.html', 'text/html;charset=utf-8');
	});
});
