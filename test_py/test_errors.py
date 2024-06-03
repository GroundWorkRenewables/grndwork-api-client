from src_py.grndwork_api_client.errors import RequestError


def describe_request_error_to_string():
    def it_returns_error_name_and_message():
        error = RequestError('Bad Request')

        assert f'{error}' == 'RequestError: Bad Request'

    def it_returns_errors():
        error = RequestError('Bad Request', [
            {'message': 'Not a valid request'},
        ])

        assert f'{error}' == 'RequestError: Bad Request\nNot a valid request'

    def it_returns_errors_field():
        error = RequestError('Bad Request', [
            {'field': 'prop', 'message': 'Is required'},
        ])

        assert f'{error}' == 'RequestError: Bad Request\nField "prop" is required'
