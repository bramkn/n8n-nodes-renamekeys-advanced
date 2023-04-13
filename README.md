![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-renamekeys-advanced

This is an n8n community node. It is based on the renamekeys node. It adds some extra quality of life functionality.
* Keep only renamed keys.
* Use a Template to rename keys, providing flexibility and ease of use to the node.
* If new key name isn't set, keep the field but not rename it.(helpful for keep only renamed keys)

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Developer

Hi, 

My name is Bram and I am the developer of this node.
I am an independant consultant and expert partner of n8n.
My nodes are free to use for everyone, but please consider [donating](https://donate.stripe.com/3cs5oe7xM6L77Yc5ko) when you use my nodes.
This helps me to build and maintain nodes for everyone to use.

If you are looking for some outside help with n8n, I can of course also offer my services.
* Node Development
* Workflow Development
* Mentoring
* Support

Please contact me @ bram@knitco.nl if you want to make use of my services.

For questions or issues with nodes, please open an issue on Github.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Compatibility

This node was developed and tested with version 0.193.3 of n8n.

## Usage

The node works the same as the default renamekeys node. The added boolean named "Keep Only Renamed" works the same as the boolean in the SET node.

The Template that can be added is used for setting the Keys you want renamed.
All different options to set keys work at the same time.
There is an order to it, as keys can be renamed by further functionality.
1. Template
2. Normal
3. Regex

## Example

### Workflow
![Workflow](https://github.com/bramkn/n8n-nodes-renamekeys-advanced/blob/master/images/workflow.png)

### Template
![Template](https://github.com/bramkn/n8n-nodes-renamekeys-advanced/blob/master/images/template.png)

### Node
![Example](https://github.com/bramkn/n8n-nodes-renamekeys-advanced/blob/master/images/example.png)


## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## Version history

v1: first version. No new functionality in development at this time.

## License

[MIT](https://github.com/n8n-io/n8n-nodes-starter/blob/master/LICENSE.md)
