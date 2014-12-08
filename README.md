# PhysicsJS

A modular, extendable, and easy-to-use physics engine for javascript.

Latest version: 0.7.0 (beta)

## Usage

**Please [visit the website](http://wellcaffeinated.net/PhysicsJS/) for
details about installation and usage**.

Distribution files are in the `dist/` directory.

## Contributing

Source code is kept in the `src/` directory. After any source code
modifications it will be necessary to run the grunt build task to
rebuild the source and run unit tests.

First install [grunt](http://gruntjs.com/).

Next install dev dependencies:

    $ npm install

then run grunt

    $ grunt

The default grunt task will create a `_working/` directory with the
PhysicsJS development build. You can play around with that.
**NOTE**: the `_working/` directory won't be committed
(it is in .gitignore).

After you run this you can use (Mr.doob's) htmleditor in `editor/` to play around.

If you want grunt to automatically create the development build
when you modify the source in `src/` then run:

    $ grunt watch

**Note** grunt watch won't run unit tests.

### Pull Requests

If you are contributing a bug-fix or a very minor addition, feel free to
do a pull request on the master branch.

If it is something else create a new (or existing) feature branch (eg: `feature/MY_FEAT`)
and issue a pull request on that.

If unsure, create an issue to discuss.

Please ensure that:

* the files in `dist/` are _unmodified_.
* the features you add are well documented with jsdoc comments if applicable.
* the code is indented with 4 space characters.

## License MIT

Copyright (c) 2013 Jasper Palfree http://wellcaffeinated.net/PhysicsJS/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
