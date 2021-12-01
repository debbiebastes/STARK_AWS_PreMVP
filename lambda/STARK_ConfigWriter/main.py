#This is the Lambda function of the Lamba-backed custom resource used 
#   during the deployment of STARK infrastructure itself the creates the  
#   configuration file for resources that the code generator needs.

#Python Standard Library
import base64
import json
import os
import textwrap

#Extra modules
import boto3
from crhelper import CfnResource

s3  = boto3.client('s3')

helper = CfnResource() #We're using the AWS-provided helper library to minimize the tedious boilerplate just to signal back to CloudFormation

@helper.create
@helper.update
def make_config_file(event, _):
    print(f"Creating STARK configuration file...")

    codegen_bucket_name  = os.environ['CODEGEN_BUCKET_NAME']
    bucket_preloader_arn = os.environ['BUCKET_PRELOADER_ARN']
    cf_writer_arn        = os.environ['CF_WRITER_ARN']
    cg_dynamic_arn       = os.environ['CG_DYNAMIC_ARN']
    cg_static_arn        = os.environ['CG_STATIC_ARN'] 

    source_code = f"""\
        BucketPreloaderLambda_ARN: '{bucket_preloader_arn}'
        CFWriter_ARN: '{cf_writer_arn}'
        CGDynamic_ARN: '{cg_dynamic_arn}'
        CGStatic_ARN: '{cg_static_arn}'
        """

    source_code = textwrap.dedent(source_code)
    print(source_code)
    deploy(source_code=source_code, bucket_name=codegen_bucket_name, key=f"STARKConfiguration/STARK_config.yml", content_type='text/yml')

@helper.delete
def delete_action(event, _):
    print("Delete action - no action...")

def lambda_handler(event, context):
    helper(event, context)

def deploy(source_code, bucket_name, key, content_type='text/plain'):

    response = s3.put_object(
        Body=source_code.encode(),
        Bucket=bucket_name,
        Key=key,
        ContentType=content_type,
    )

    return response