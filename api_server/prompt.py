

imgListPrompt = '''
Please provide a list of up to 10 items that are both popular among children and 
suitable for aiding them in learning a new language. 
Consider not only the items' popularity but also their educational value for language learners. 
The output should be a comma-separated string without any additional explanation.

Example of output
Dog, Cat, Cow, Sheep, Chicken, Frog, Duck, Pig, Horse, Elephant
'''


def return_prompt(promptType='imgList'):
    if promptType == 'imgList':
        return imgListPrompt
    else:
        return 'Prompt not found.'
