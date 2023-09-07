class PromptType:
    def __init__(self, prompt_type, prompt_msg):
        self.prompt_type = prompt_type
        self.prompt_msg = prompt_msg

    def get_msg(self):
        return self.prompt_msg


class ImgListPrompt(PromptType):
    imgListPrompt = '''
    Please generate a list of 10 to 15 words suitable for assisting children in learning a new language. 
    The list should be inspired by the user's query or a topic within it. 
    This output will be used for image searches, so please consider that. 
    Provide the list as a comma-separated string without any additional explanation.
    
    The user query
    {query}

    Example of output
    Dog, Cat, Cow, Sheep, Chicken, Frog, Duck, Pig, Horse
    '''

    def __init__(self):
        super().__init__('imgList', self.imgListPrompt)


class ImgGenPrompt(PromptType):
    imgGenPrompt = '''
    The generated image should be designed to captivate children based on the user query. 
    
    The user query
    {query}
    '''

    def __init__(self):
        super().__init__('imgGen', self.imgGenPrompt)


def return_prompt(prompt_type):
    prompt_types = {
        'imgGen': ImgGenPrompt,
        'imgList': ImgListPrompt
    }

    if prompt_type in prompt_types:
        prompt_instance = prompt_types[prompt_type]()
        return prompt_instance.get_msg()

    return 'Prompt not found.'
