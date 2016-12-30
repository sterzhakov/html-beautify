![alt tag](https://raw.githubusercontent.com/sterjakovigor/html-beautifier/master/logo.jpg)

# How it work?

Inserts spaces and break lines into html string. It looks like this:

```html
<!-- Before -->
<div><p>Hello <b>world</b>!</p><p>How are you?</p></div>

<!-- After -->
<div>
  <p>Hello <b>world</b>!</p>
  <p>How are you?</p>
</div>
```

# How to use?
```javascript
import htmlBeautifier from 'html-beautifier'
htmlBeautifier("<div><p>Hello <b>world</b>!</p></div>")
// => "<div>\n<p>\n Hello <b>world</b>!\n</p>\n</div>"
```
Also you can pass string with spaces and break lines, it will be remove it and add them again.
