

export const executeShareUrl = (categoryId: string) => {
    const root = location.protocol + '//' + location.host;
    navigator.clipboard.writeText(`${root}/gen?categoryId=${categoryId}`)
    alert('The url has been copied to your clipboard.');
}


export const downloadZip = async (downloadData: any) => {
    if (downloadData) {
        try {
            const url = window.URL.createObjectURL(new Blob([downloadData]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'images.zip');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error(error);
        }
    }
}