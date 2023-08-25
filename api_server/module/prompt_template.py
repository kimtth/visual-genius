class PromptType:
    def __init__(self, prompt_type, prompt_msg):
        self.prompt_type = prompt_type
        self.prompt_msg = prompt_msg

    def get_msg(self):
        return self.prompt_msg


class ImgListPrompt(PromptType):
    imgListPrompt = '''
    Please provide a list of up to 10 items that are both popular among children and 
    suitable for aiding them in learning a new language. 
    Consider not only the items' popularity but also their educational value for language learners. 
    The output should be a comma-separated string without any additional explanation.

    Example of output
    Dog, Cat, Cow, Sheep, Chicken, Frog, Duck, Pig, Horse, Elephant
    '''

    def __init__(self):
        super().__init__('imgList', self.imgListPrompt)


class ImgGenPrompt(PromptType):
    imgGenPrompt = '''
    Generate a creative and surprising cartoon-style illustration on a topic determined through reasoning based on user input.
    The generated image should be designed to captivate children. 
    It should be an illustrated image, as possible in Japanese manga-style.
    '''

    def __init__(self):
        super().__init__('imgGen', self.imgGenPrompt)


def return_prompt(prompt_type):
    prompt_types = {
        'imgGen': ImgGenPrompt,
        'imgList': ImgListPrompt
    }

    if prompt_type in prompt_types:
        return prompt_types[prompt_type].get_msg()

    return 'Prompt not found.'
