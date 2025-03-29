---
title: Dead simple IMDSv1 -> IMDSv2 migration guide
description: All you need to know for migrating between AWS IMDSv1 and IMDSv2
layout: blog-base.njk
---

I was recently asked to upgrade our AWS EC2 instances such that they use the new IMDSv2 service from AWS and not accept any more requests to the IMDSv1 endpoint.

I probably had to go about this problem 3 or so times because every deployment either didn't work or caused some sort of outage in our staging environment so I thought I'd write it here in an attempt to save you maybe an extra couple hours if you have to do it yourself. Enjoy!



## What is IMDS?

IMDS is the Instance Metadata Service that's used by EC2 instances and other services to:

- Manage AWS credentials
- Provide the current metadata of the running EC2 instance
- (I think) Also control the instance in certain ways

IMDS is provided by a HTTP endpoint and the endpoints differ between IMDS v1 and v2.



## Why do we need to upgrade?

In my case it was a part of our compliance audit but in general you should upgrade because IMDSv1 is insecure.

Put simply, IMDSv1 is like an unauthenticated REST API that could potentially expose secrets and internal data.

IMDSv2 is more secure because it actually uses authentication.



## What's the difference between v1 and v2?

Not much:
- Different method of access
- Different features
- Different security methods

On a more technical level, what differentiates v1 and v2 is whether or not HTTP tokens are required (v2) or optional (v1).



## HTTP tokens?

You need to authenticate somehow, right?

This is going to seem a little counter-intuitive from a technical level but if you know how IAM works under the hood then you should be yawning as you read this...

In order to authenticate itself for IMDSv2, the AWS client running on the EC2 instance needs to first get a token. This is a temporary token that is obtained by calling a particular endpoint (yes, it just gives it the token) and then once you have that token, it will last for a small amount of time and will allow you to make IMDSv2 calls. If you can't contact this token service, then your app won't be able to interact with the IMDS service.



## How do I know if I need IMDS at all?

Could be any of the following:
- You use an AWS client on your app that's hosted by EC2 and need the credentials provided by the instance in order to interact with AWS services
- You have some special use-case where you need granular control over instances using your own specialised setup/software instead of something like an Auto-scaling group or other automations
- You directly need to collect metadata of your EC2 instances (for some reason)

You can also double-check if you are currently using IMDS anywhere in your codebase (and prevent a production outage) by searching for this IP in your codebase(s) `169.254.169.254`. If you don't pass the token from the IMDS service into any interactions with this host then it's likely you are using IMDSv1.


## How do I know if I need to upgrade?

There are two places you should look...

### I'm using an Auto-scaling group (ASG)

If you have an ASG, you will likely have an EC2 launch template connected to it.

To find your launch template, go to AWS EC2 > Auto scaling groups > Click on the one you want > Click on the launch template > Make sure you select the version you are using (or the latest) > Advanced details

In this launch template, you will see the following values:

![](/media/launch_template.png)

You probably guessed, but everything that has "Metadata" in it has to do with IMDS.

These are the 3 states for "Metadata version":
- Token required 👍
- Token optional 👎
- Blank (metadata accessible = disabled) 👍

I'll get to the other fields later...

### I just have a standalone EC2 instance

This one's easy, just go into the instance and look for this section:

![](/media/instance_imds.png)

Again, like above, it's either required, optional or disabled.




## How do I upgrade?

In this section, I'm going to tell you what needs to change and why instead of telling you directly how to do it. Whether you use the AWS console or IaC like Terraform, I don't care, but I expect that you are quite fluent in what you do.

### How do I test my changes?

Before you change any IaC code, you might want to experiment with a single instance first so you can get the config right. The metadata config can be changed while the instance is hot so it's not that hard to test.

You can set the metadata on your instance like so:

```
aws ec2 modify-instance-metadata-options \
     --instance-id i-1234567890abcdef0 \
     --http-tokens optional \
     --http-put-response-hop-limit 1 \
     --http-endpoint enabled
```

Then you can go and connect to the instance. Now, there are two ways to test this:
1. If you run containerised apps (I sure hope you are), you are likely using a container daemon. You should enter an interactive shell in one of your containers before running the command below.
2. If you are running without containerisation then god bless you and you can run the thing below wherever your app will be running.


This command will try and obtain a token from the IMDSv2 token endpoint:

```
curl -X PUT "http://169.254.169.254/latest/api/token"
```

### What needs to change

If you are using an ASG, the launch template in the ASG is the thing that needs to change. Otherwise you can modify an instance by using a command like above.

To enable IMDSv2 and disable IMDSv1, update the following:
- Metadata accessible: Enabled
- Token hop limit: Usually 1 or 2 (You can test this using the commands above. If you are using a container daemon, then likely this will be 2 as you will also likely be using the inbuilt container network instead of the host network. This means your packets do an extra hop between the app and the EC2 instance itself)
- HTTP tokens: Required


### Notes on ASGs

When changing the launch template, all current instances will not be changed to using the new config so these will still be vulnerable. You can fix this by doing what's called an [instance refresh](https://docs.aws.amazon.com/autoscaling/ec2/userguide/asg-instance-refresh.html). This will gradually replace all the instances that are running your app. I recommend refreshing your instances like so:
- Select launch before terminate (So that your capacity is similar and there's minimal end-user impact)
- Make sure under the "Desired configuration" section that you select "Update launch template" and then select the new launch template.




## Bless AWS for really prioritising what's important 🙏

[https://github.com/boto/boto3/issues/313](https://github.com/boto/boto3/issues/313)

![](/media/1743220268.png)