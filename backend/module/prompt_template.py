class PromptType:
    def __init__(self, prompt_type, prompt_msg):
        self.prompt_type = prompt_type
        self.prompt_msg = prompt_msg

    def get_msg(self):
        return self.prompt_msg


class ImgListPrompt(PromptType):
    imgListPrompt = '''
    Please generate a list of 10 to 15 words suitable for assisting children in learning a new language. 
    The list should be inspired by the user's query or a topic within it and persona. 
    This output will be used for image searches, so please consider that. 
    Provide the list as a comma-separated string without any additional explanation.
    
    The user query
    {query}

    The user persona
    {persona}

    Example of output
    Dog, Cat, Cow, Sheep, Chicken, Frog, Duck, Pig, Horse
    '''

    def __init__(self):
        super().__init__('imgList', self.imgListPrompt)


class ImgStepPrompt(PromptType):
    imgStepPrompt = '''
    Please generate steps list based on the user's query or a topic within it and persona.
    Each step should be concise and clear, less than 20 characters suitable for assisting children's education.
    This output will be used for image searches, so please consider that. 
    The output should be a comma-separated string without any additional explanation.
    
    The user query
    {query}

    The user persona
    {persona}

    Example of output
    Look at the picture, Read the text, Listen to the audio, Repeat the word, Repeat the sentence
    '''

    def __init__(self):
        super().__init__('imgStep', self.imgStepPrompt)



class ImgGenPrompt(PromptType):
    imgGenPrompt = '''
    The generated image should be designed to captivate children based on the user query.
    This output will be used for an input text for the image generation, so please consider that. 
    
    The user query
    {query}
    '''

    def __init__(self):
        super().__init__('imgGen', self.imgGenPrompt)


def return_prompt(prompt_type):
    prompt_types = {
        'imgGen': ImgGenPrompt,
        'imgStep': ImgStepPrompt,
        'imgList': ImgListPrompt
    }

    if prompt_type in prompt_types:
        prompt_instance = prompt_types[prompt_type]()
        return prompt_instance.get_msg()

    return 'Prompt not found.'
