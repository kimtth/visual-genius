class PromptType:
    def __init__(self, prompt_type, prompt_msg):
        self.prompt_type = prompt_type
        self.prompt_msg = prompt_msg

    def get_msg(self):
        return self.prompt_msg


class ImgListPrompt(PromptType):
    imgListPrompt = '''
    # Role:
    You are a {persona}. As a {persona}, you are asked to generate a list of words.
    The list should be inspired by the user query and "{persona}". 
    
    # Task Description:
    1. Please generate a list of words related to the user query.
    2. If there is a mention of a specific object, please include that.
    3. Provide the list as a comma-separated string without any additional explanation or sentences.
    4. Don't add a comma in each word.
    5. Must generate a list of up to 20 words. Don't include more words if there is no guidance in the user's query.
    
    # Desired format:
    Desired format must a single line of string without tagging.

    Dog, Cat, Cow, Sheep, Chicken, Frog, Duck, Pig, Horse
    '''

    def __init__(self):
        super().__init__('imgList', self.imgListPrompt)


class ImgStepPrompt(PromptType):
    imgStepPrompt = '''
    # Role:
    You are a {persona}. As a {persona}, you are asked to generate a list of steps.
    The list should be inspired by the user query and "{persona}". 

    # Task Description:
    1. Please generate steps related to the user query.
    2. If there is a mention of a specific step, please include that.
    3. Steps should consider sequence order.
    4. Provide the list as a comma-separated string without any additional explanation.
    5. Don't add a comma in each step.
    6. Must generate a list of up to 15 steps. Don't include more steps if there is no guidance in the user's query.
    
    # Desired format:
    Desired format must a single line of string.

    Look at the picture, Read the text, Listen to the audio, Repeat the word, Repeat the sentence
    ###
    '''

    def __init__(self):
        super().__init__('imgStep', self.imgStepPrompt)



class ImgGenPrompt(PromptType):
    imgGenPrompt = '''
    # Role:
    You are an expert in creating images from text. Your job is to turn user requests into simple sentences.

    # Task Description:
    Your job is to change the user’s request into a short and clear sentence. 
    This sentence will be used to make an image. 
    Make sure the sentence does not have any extra words that shouldn’t be in the image. 
    If the user’s request is not clear, like a single word or a short phrase, 
    you should make a sentence that is most likely to create the right image.
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
