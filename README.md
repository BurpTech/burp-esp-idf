# burp-esp-idf

Monolithic project for developing apps and components for various esp32 target devices using the [ESP-IDF](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/index.html).

# Requirements

- ESP-IDF
  - You should install the ESP-IDF following the manual install procedure described [here](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/get-started/index.html#software)
  - You should also configure the `get_idf` alias as described in that guide

# Structure

```
- applications/ - the various applications available
  - <application_name> - Each application should be a valid, target independent ESP-IDF component exporting an interface as required by the associated top level container project
  - ...
- components/ - shared components used by the applications
  - <component_name> - Each component should be a valid, target independent ESP-IDF component
  - ...
- projects/ - top level container projects to provide independent builds for each target device
  - <project_name> - Each project should contain target specific ESP-IDF sub-projects
    - <target_name> - Each target should be an ESP-IDF project configured to target a specific device variant and should imprt and run the associated target independent application component
    - ...
  - ...
- tools/ - development tools
  - burp/ - Python CLI to simplify building, flashing and monitoring multiple target devices
  - burp-web-app/ - React front-end for the `serve` command of the `burp` python CLI
```

# Development workflow

The development environment is dependent on the `idf.py` tool. Set this up before using other commands by importing the ESP-IDF environment (eg. using `get_idf`).

A more complete guide to the `idf.py` tool can be found [here](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-guides/build-system.html#idf-py)

Generally you will want to work in the device specific projects. Eg. if using CLion (Intellij), then open and create projects in each of the device specific project directories. Doing it this way will avoid problems of selecting the correct `CMakeLists.txt` to configure dependencies, etc. From then on you will likely only need to work in a single variant in order to update the target independent code.

Use the `burp` CLI tool to build, flash and monitor all target devices at once.

## Adding a component

- Switch to the `components/` directory
- Create the component with `idf.py create-component <component_name>`

## Adding an application

- Switch to the `applications/` directory
- Create the application with `idf.py create-component <application_name>`

As a convention, it is recommended to use the associated `<project_name>` for the `<application_name>` as well.

## Adding a project

- Switch to the `projects/` directory
- Create the project specific directory `mkdir <project_name>`

Then create ESP-IDF projects for each target device.

As a convention, it is recommended to use the associated `<application_name>` for the `<project_name>` as well.

## Adding a target device to a project

- Switch to the `projects/<project_name>/` directory
- Create the ESP-IDF project with `idf.py create-project <target_name>`
- Switch to the `target_name/` directory
- In `CMakeLists.txt`, change the `project` field to include the `<project_name>`, ie. change `project(<targetname>)` to `project(<project_name>-<target_name>)`. This convention will provide better namespacing for your IDE project names
- Set the target device using `idf.py set-target <device_name>`
- Set further configuration options with `idf.py menuconfig`
- Integrate the associated application component

As a convention, it is recommended to use the `<device_name>` for the `<target_name>` as well.

