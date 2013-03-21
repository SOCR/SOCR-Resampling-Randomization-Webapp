# Goal #
The goal of this project is to design a new, modern and portable SOCR web-app that demonstrates the concepts of statistical resampling, randomization and probabilistic simulation, which is purely based on HTML5, CSS3 and JavaScript framework. The implementation of this project demands platform portability, computational efficiency, usability (complete functionality via user-friendly modern interface), extensibility and ease of documentation, support and servicing to the entire community.

# Wiki #
For more information regarding this project see [SOCR Wiki](http://wiki.stat.ucla.edu/socr/index.php/SOCR_Resampling_HTML5_Project)

# Installation #
The application needs to be hosted in a server. 
If you want to run it locally in your machine, just extract the source code from git and place it in the www folder of wamp OR you can use any other apache server.

Incase of deploying it to a hosted server, just pull all the code into the server and run the index.html. For example, If I need to host the application at www.mydomain.com/app , then place the code in the app/ folder in the server and you are good to go!


# Deploy URL #
The application is currently hosted [Here](http://socr.ucla.edu/htmls/HTML5/SOCR_Resampling_Webapp/) . Go ahead and give it a try. The application is optimized for mobile view.

# Technologies #

The frontend of application has heavy usage of Twitter Bootstap v2.2. The backend JS code is primarily vanilla with certain specific libraries to augument the functionality of the app.
* [head.js](http://headjs.com/)
* [JQuery](http://jquery.com)
* [D3.js](http://d3js.org)

# App Structure #
The appliction earlier written in a pseudo - MV* pattern, in latest revision(s) is incorporated the *SOCR* namespace.
Current Organisation
### socr.model
### socr.view
### socr.controller
### socr.input
### socr.exp
	_ballAndUrn_
	_cardExp_
	_binomialCoin_
### socr.vis
### socr.tools
	_FCal_
	
## Copyright and License 

**The LGPL License**

Copyright (c) 2012 Statistics Online Computational Resource (SOCR) &lt;http://www.StatisticsResource.org&gt;

All SOCR programs, materials, tools and resources are developed by and freely disseminated to the entire community.

Users may revise, extend, redistribute, modify under the terms of the Lesser GNU General Public License
as published by the Open Source Initiative http://opensource.org/licenses/. All efforts should be made to develop and distribute
factually correct, useful, portable and extensible resource all available in all digital formats for free over the Internet.

SOCR resources are distributed in the hope that they will be useful, but without
any warranty; without any explicit, implicit or implied warranty for merchantability or
fitness for a particular purpose. See the GNU Lesser General Public License for
more details see http://opensource.org/licenses/lgpl-license.php.
