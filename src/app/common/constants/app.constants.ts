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
  },

  PRODUCT_CREATED: {
    toasterType: 'PRODUCT_CREATED',
    isVisible: true,
    Message:'Product Created Successfuly',
  },

  PRODUCT_UPDATED: {
    toasterType: 'PRODUCT_UPDATED',
    isVisible: true,
    Message:'Product Updated Successfuly',
  },

  PRODUCT_DELETED: {
    toasterType: 'PRODUCT_DELETED',
    isVisible: true,
    Message:'Product Deleted Successfuly',
  },

  ORDER_STATUS_UPDATED: {
    toasterType: 'ORDER_STATUS_UPDATED',
    isVisible: true,
    Message:'Order Status Updated Successfuly',
  },
}
