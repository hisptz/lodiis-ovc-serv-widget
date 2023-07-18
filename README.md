# LODIIS OVC SERVE WIDGET

## Contents

1.  #### [Introduction](#introduction)
2.  #### [Pre-requisites](#pre-requisites)
3.  #### [Project setup](#setup)
4.  #### [Running the app](#run)
5.  #### [Building the widget](#build)

## <a name='introduction'></a>1. About

This is a DHIS2 dashboard widget application that aims at providing the OVC SERVE indicators for the OVC program in the Lesotho OVC-DREAMS Integrated Information System (LODIIS). It extends the power of DHIS2 by providing the complex OVC SERVE indicator calculations to the DHIS2 dashboards.

## <a name='pre-requisites'></a>2. Pre-requisites

The project requires the following environment prerequisites to get started:

```
node 16.13.2
npm 8.3.2
react 17.0.2
```

## <a name='setup'></a>3. Project setup

To get started with this project, follow the following procedure.

<ol>
<li>Package installations</li>
<li>Proxy configuration</li>
</ol>

### Package installations

With the use of <b>yarn</b>, these app packages are maintained with only one _***package.json***_. <br>
To get started with package installations, Use the command:

```
yarn
```

or

```
yarn add
```

### Proxy configuration

In order to start the development server for the LODIIS OVC SERVE widget, there has to be a set proxy to the server hosting the DHIS2 instance.

The proxy can be configured by adding the `.env` file at the root directory with content as on the`.env.example` or as shown below

```
SKIP_PREFLIGHT_CHECK=true
DHIS2_PROXY=<url-to-dhis2-instance>
VITE_REACT_APP_DHIS2_BASE_URL=http://localhost:8080
VITE_REACT_APP_DHIS2_USERNAME=<dhis2-user-name>
VITE_REACT_APP_DHIS2_PASSWORD=<dhis2-user-password>

```

## <a name='run'></a>4. Running the app

The apps are run differently using the script commands that are specified on the root _***package.json***_.

<ul>
<li>Use the following command to run the project in a development server<br>

```
yarn dev
```

 </li>

</ul>

## <a name='build'></a>5. Building the widget

Building the widget can be done by running the below command on the.

```
yarn build
```

This will create a zip folder in `build/bundle` directory with the build ready for deployment.

  </li>
  
</ul>
