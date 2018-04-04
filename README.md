# @servicestack/editor

ServiceStack Markdown Editor is a developer-friendly Markdown Editor for Vuetify Apps which is optimized [GitHub Flavored Markdown](https://guides.github.com/features/mastering-markdown/) where it supports popular short-cuts for editing and documenting code like tab block un/indenting, single-line and code and comments blocks.

![](https://i.imgur.com/J9jRuvQ.png)

## Live Demo

This component was built for [techstacks.io](https://techstacks.io) website where it's used extensively for all posts, comments and anywhere else allowing rich markup using Markdown.

## Install

    $ npm install @servicestack/editor

## Usage

Import and register the Editor Vuetify component with your Vue Component to use it like a Vue Input Control, e.g:

```html
<template>
    <Editor v-model="content" label="Markdown" />
</template>

<script>
import Editor from "@servicestack/editor";

export default {
  components: { Editor },
}
</script>
```

As it's a wrapper around a [Vuetify text field](https://vuetifyjs.com/en/components/text-fields) it has access to a lot of the rich standard functionality available in Vuetify controls:

Vuetify properties:

 - `v-model`
 - `label`
 - `counter`
 - `rows`
 - `rules`
 - `errorMessages`
 - `autofocus`
 - `disabled`

Editor properties:

 - `lang` - which language to use for syntax highlighting in code comment blocks

Events:

 - `@save`  - method to invoke when user clicks **Save** icon or `Ctrl+S` keyboard shortcut
 - `@close` - method to invoke when user presses the `ESC` key

## Keyboard Shortcuts

For added productivity the Editor supports many of the popular Keyboard shortcuts in found in common IDEs:

![](https://i.imgur.com/PXqkSuN.png)

> Note: pressing the shortcut multiple times toggles on/off the respective functionality

## Example Usage

The [CommentEdit.vue](https://github.com/NetCoreApps/TechStacks/blob/master/src/TechStacks/src/components/CommentEdit.vue) 
shows a nice small and complete example of using the Editor for editing existing comments or submitting new ones. 

It provides a user-friendly UX with declartive client and server-side validation where 'content' field validation errors
show up next to the Editor dialog whilst other errors are displayed in the FORM's `<v-alert/>` summary message.

Annotations were added to the implementation below to describe how the component works:

```html
<template>
    <v-form v-model="valid" ref="form" lazy-validation>
        <v-card>
            <v-card-text>
                <v-alert outline color="error" icon="warning" :value="errorMessage()">{{ errorMessage() }}</v-alert>                  

                    <Editor ref="editor"
                        label="Comment"
                        v-model="content"
                        :rows="6"
                        :counter="1000"
                        :rules="[ v => !v || v.length <= 1000 || 'Max 1000 characters' ]"
                        :error-messages="errorResponse('content')"
                        :lang="csharp"
                        :autofocus="true"
                        @save="submit"
                        @close="reset()"
                    />

            </v-card-text>
            <v-card-actions>
                <v-layout>
                    <v-btn flat @click="submit">Submit</v-btn>
                    <v-btn v-if="replyId || comment" flat @click="reset(false)">Close</v-btn>
                </v-layout>
            </v-card-actions>
        </v-card>
    </v-form>
</template>

<script>
import Editor from "@servicestack/editor";
import { mapGetters } from "vuex";
import { errorResponse } from "@servicestack/client";
import { createPostComment, updatePostComment } from "~/shared/gateway";

// Editable comment fields
const comment = {
    postId: null,
    content: null
};

export default {
    components: { Editor },
    props: ['post', 'comment', 'replyId', 'autofocus'],

    methods: {
        // Show top-level error messages or errors for the 'postId' field in the <v-alert/> summary dialog
        errorMessage() {
            return this.errorResponse() || this.errorResponse('postId'); 
        },

        // Clear the form back to its original state
        reset(added){
            this.responseStatus = this.content = null;
            this.valid = true;
            this.$emit('done', added);
        },

        // Submit the comment to the server and overlay any error responses back on the form
        async submit() {
            if (this.$refs.form.validate()) { // Check if form passes all client validation rules
                try {
                    this.$store.commit('loading', true);  // indicate to the App that an API request is pending
                    
                    // If component was initialized with an existing `comment` update it, otherwise create a new one
                    const response = this.comment != null
                        ? await updatePostComment(this.comment.id, this.post.id, this.content)
                        : await createPostComment(this.postId, this.content, this.replyId);

                    this.reset(true); // Clear the form back to a new state when successful

                } catch(e) {
                    this.valid = false;                          // mark this form as invalid
                    this.responseStatus = e.responseStatus || e; // populate the server error response
                } finally {
                    this.$store.commit('loading', false); // indicate to the App that the API request has completed
                }
            }
        },
        
        // Register `errorResponse` function so it's available in the template
        errorResponse, 
    },

    // Initialize the component data from its properties
    mounted() {
        if (this.post) {
            this.postId = this.post.id;
        }
        if (this.comment) {
            this.content = this.comment.content;
        }
    },

    data: () => ({
        ...comment,           // Create reactive properties for all `comment` fields
        valid: true,          // Holds whether the form is in an invalid state requiring user input to correct
        responseStatus: null, // Captures the servers structured error response
    }),
}
</script>
```

The `errorResponse` method from the [@servicestack/client](https://github.com/ServiceStack/servicestack-client) npm package is opinionated
in handling ServiceStack's [structured API Response Errors](http://docs.servicestack.net/error-handling) but will work for any API returning
the simple error response schema below:

```json
{
    "errorCode": "ErrorCode",
    "message": "Descriptive Summary Error Message",
    "errors": [
        {
            "fieldName": "content",
            "errorCode": "NotEmpty",
            "message": "Descriptive Error Message for 'content' Field"
        }
    ]
}
```

Which will check the components `this.responseStatus` property to return different error messages based on what field it was called with, e.g:

```js
errorResponse()          //= Descriptive Summary Error Message
errorResponse('postId')  //= undefined
errorResponse('content') //= Descriptive Error Message for Field Error
```

## Feedback and Support

ServiceStack Customers can ask questions, report issues or submit feature requests from the [ServiceStack Community](https://techstacks.io/servicestack).

If you're not a Customer, please [ask Questions on StackOverflow](https://stackoverflow.com) with the `[servicestack]` hash tag.

Pull Requests for fixes and new features are welcome!
