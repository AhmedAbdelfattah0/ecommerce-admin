export const toasterCases = {
  DEFAULT: {
    toasterType: '',
    isVisible: false,
    viewLink: {
      link: '',
      isVisible: false,
    },
  },
  UnDEFAULT: {
    toasterType: 'ORDER_SUCCESS',
    isVisible: true,
    Message:'Order Created Successfuly',
    viewLink: {
      link: '',
      isVisible: false,
    },
  },

  MESSAGE_SENT: {
    toasterType: 'MESSAGE_SENT',
    isVisible: true,
    Message:'Thanks for reaching out we will get back to you sone',
    viewLink: {
      link: '',
      isVisible: false,
    },

}
}
