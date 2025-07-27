import React from 'react'
import styles from './error-message.module.css'

export const ErrorMessage = ({messageText = "Sorry, something went wrong :("}) => {
    return (
        <div className={styles.errorMessageContainer}>
            <div className={styles.errorMessageText}>
                <p>{messageText}</p>
            </div>
        </div>
    )
}


